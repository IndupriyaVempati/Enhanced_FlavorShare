import React from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

const RecipePDF = ({ recipe }) => {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    const lineHeight = 7;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(recipe.title, pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;

    // Ingredients
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Ingredients:", margin, yPos);
    yPos += lineHeight;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const ingredients = recipe.ingredients.split(",").map(i => "• " + i.trim());
    ingredients.forEach(ingredient => {
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(ingredient, margin, yPos);
      yPos += lineHeight;
    });
    yPos += lineHeight;

    // Instructions
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Instructions:", margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    const instructionLines = recipe.instructions
      .split(/\r?\n/)
      .filter(step => step.trim());

    instructionLines.forEach((step, index) => {
      // Try to match formatted instructions (with ** and –)
      const formattedMatch = step.match(/^\d+\.\s*\*\*(.*?)\*\*\s*–\s*(.*)$/);
      
      if (formattedMatch) {
        // Handle formatted instructions
        const [, title, description] = formattedMatch;
        
        // Add step number and title in bold
        doc.setFont("helvetica", "bold");
        const stepNumber = `${index + 1}. ${title}`;
        
        if (yPos > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(stepNumber, margin, yPos);
        yPos += lineHeight;
        
        // Add description in normal font
        doc.setFont("helvetica", "normal");
        const descriptionLines = doc.splitTextToSize(`– ${description}`, contentWidth - 10);
        descriptionLines.forEach(line => {
          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
      } else {
        // Handle simple instructions
        const cleanStep = step.trim().replace(/^\d+\.\s*/, '');
        if (cleanStep) {
          if (yPos > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
          }
          const stepText = `${index + 1}. ${cleanStep}`;
          const lines = doc.splitTextToSize(stepText, contentWidth);
          lines.forEach(line => {
            doc.text(line, margin, yPos);
            yPos += lineHeight;
          });
        }
      }
      
      yPos += lineHeight / 2; // Add some space between steps
    });

    doc.save(`${recipe.title.toLowerCase().replace(/\s+/g, '-')}-recipe.pdf`);
  };

  return (
    <button className="btn btn-outline-success" onClick={generatePDF}>
      Download PDF
    </button>
  );
};

export default RecipePDF;
