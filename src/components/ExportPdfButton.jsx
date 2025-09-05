import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportPDFButton = ({ sectionId }) => {
  const exportPDF = async () => {
    const input = document.getElementById(sectionId);

    if (!input) {
      alert("Section not found!");
      return;
    }

    // Clone the section content
    const clonedSection = input.cloneNode(true);

    // Remove Edit/Delete buttons
    const buttonContainers = clonedSection.querySelectorAll(".flex.gap-2");
    buttonContainers.forEach((container) => container.remove());

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;
    const pageWidth = 210;
    const pageHeight = 297;
    let y = margin + 10; // Starting y position after title

    // Add main title
    pdf.setFontSize(16);
    pdf.setTextColor(31, 41, 55);
    pdf.text("ACS-2 Schedule", margin, margin + 5);
    y = margin + 15;

    // Get all table blocks
    const blocks = clonedSection.querySelectorAll(".overflow-x-auto");

    blocks.forEach((block) => {
      const header = block.querySelector("h3").textContent;
      const tableEl = block.querySelector("table");

      // Extract table data
      const rows = tableEl.querySelectorAll("tbody tr");
      const rawRows = [];
      let currentShift = "";
      let currentTime = "";

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        let shift, time, breakTime, namesTd;

        if (cells.length === 4) {
          shift = cells[0].textContent.trim();
          time = cells[1].textContent.trim();
          breakTime = cells[2].textContent.trim();
          namesTd = cells[3];
          currentShift = shift;
          currentTime = time;
        } else if (cells.length === 2) {
          shift = currentShift;
          time = currentTime;
          breakTime = cells[0].textContent.trim();
          namesTd = cells[1];
        } else {
          // Skip or handle unexpected row structure
          return;
        }

        const names = Array.from(namesTd.querySelectorAll("div"), (d) =>
          d.textContent.trim()
        );
        const namesCell = names.join("\n");

        rawRows.push({ shift, time, breakTime, namesCell });
      });

      // Build merged table data
      const tableData = [];
      const shiftTracker = {};
      const timeTracker = {};

      rawRows.forEach((row, i) => {
        const shiftKey = row.shift;
        const timeKey = `${row.shift}-${row.time}`;

        const isFirstShift = shiftTracker[shiftKey] === undefined;
        const isFirstTime = timeTracker[timeKey] === undefined;

        if (isFirstShift) {
          shiftTracker[shiftKey] = rawRows.slice(i).filter(r => r.shift === row.shift).length;
        }
        if (isFirstTime) {
          timeTracker[timeKey] = rawRows.slice(i).filter(r => r.shift === row.shift && r.time === row.time).length;
        }

        const shiftCell = isFirstShift
          ? { content: row.shift, rowSpan: shiftTracker[shiftKey] }
          : { content: "" };

        const timeCell = isFirstTime
          ? { content: row.time, rowSpan: timeTracker[timeKey] }
          : { content: "" };

        tableData.push([
          shiftCell,
          timeCell,
          row.breakTime,
          row.namesCell
        ]);

        shiftTracker[shiftKey] = shiftTracker[shiftKey] ? shiftTracker[shiftKey] - 1 : 0;
        timeTracker[timeKey] = timeTracker[timeKey] ? timeTracker[timeKey] - 1 : 0;
      });

      // Add header
      pdf.setFontSize(14);
      pdf.setTextColor(31, 41, 55);
      pdf.text(header, margin, y);
      y += 8;

      // Add table using autoTable for searchable text
      autoTable(pdf, {
        body: tableData,
        startY: y,
        theme: "grid",
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9, // Smaller font for data elements
          textColor: [31, 41, 55],
          overflow: "linebreak",
          cellPadding: 3,
          lineHeight: 1.4, // Increased line height for better readability
        },
        headStyles: {
          fillColor: [226, 232, 240],
          textColor: [31, 41, 55],
          fontSize: 10,
          fontStyle: "bold",
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Shift
          1: { cellWidth: 40 }, // Time
          2: { cellWidth: 40 }, // Break
          3: { cellWidth: "auto", overflow: "linebreak" }, // Names
        },
        head: [["Shift", "Time", "Break", "Names"]],
      });

      y = pdf.lastAutoTable.finalY + 10;

      // Check for page overflow and add page if needed
      if (y > pageHeight - margin - 20) {
        pdf.addPage();
        y = margin + 10;
      }
    });

    // Add header and footer to all pages
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      // Footer
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, pageHeight - 5);
    }

    pdf.save("schedule.pdf");
  };

  return (
    <button
      onClick={exportPDF}
      className="px-4 py-2 mt-4 bg-black text-white rounded hover:bg-gray-800"
    >
      Export as PDF
    </button>
  );
};

export default ExportPDFButton;