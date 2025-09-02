import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ExportPDFButton({ sectionId }) {
  const exportPDF = async () => {
    const input = document.getElementById(sectionId);

    if (!input) {
      alert("Section not found!");
      return;
    }

    // Take screenshot of the entire section
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("ShiftSchedule.pdf");
  };

  return (
    <button
      onClick={exportPDF}
      style={{
        padding: "10px 20px",
        backgroundColor: "#000",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        marginBottom: "20px",
      }}
    >
      Export Full Schedule PDF
    </button>
  );
}
