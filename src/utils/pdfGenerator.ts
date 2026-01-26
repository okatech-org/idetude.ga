interface ReportCardData {
  studentName: string;
  className: string;
  schoolYear: string;
  trimester: number;
  generalAverage: number;
  classAverage: number;
  rank: number;
  totalStudents: number;
  grades: {
    subject: string;
    average: number;
    coefficient: number;
    teacherComment?: string;
  }[];
  teacherComment: string;
  principalComment: string;
  absences: {
    justified: number;
    unjustified: number;
    delays: number;
  };
}

export const generateReportCardPDF = (data: ReportCardData): void => {
  // Create a new window for the PDF content
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Veuillez autoriser les popups pour télécharger le bulletin");
    return;
  }

  const appreciation = getAppreciation(data.generalAverage);

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bulletin Scolaire - ${data.studentName}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a2e;
      background: white;
    }
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #1a1a2e;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24pt;
      color: #1a1a2e;
      margin-bottom: 5px;
    }
    .header h2 {
      font-size: 14pt;
      color: #4a4a6a;
      font-weight: normal;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f5f5fa;
      padding: 15px;
      border-radius: 8px;
    }
    .info-box h3 {
      font-size: 10pt;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .info-box p {
      font-size: 12pt;
      font-weight: bold;
    }
    .grades-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .grades-table th,
    .grades-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .grades-table th {
      background: #1a1a2e;
      color: white;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 9pt;
    }
    .grades-table tr:nth-child(even) {
      background: #f9f9fc;
    }
    .grades-table .average {
      font-weight: bold;
      font-size: 12pt;
    }
    .summary-section {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .summary-card {
      background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
      color: white;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card .value {
      font-size: 24pt;
      font-weight: bold;
    }
    .summary-card .label {
      font-size: 9pt;
      opacity: 0.8;
      margin-top: 5px;
    }
    .comments-section {
      margin-bottom: 20px;
    }
    .comment-box {
      background: #f5f5fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #1a1a2e;
    }
    .comment-box h4 {
      font-size: 10pt;
      color: #666;
      margin-bottom: 8px;
    }
    .comment-box p {
      font-style: italic;
    }
    .absences-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .absence-card {
      text-align: center;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .absence-card .value {
      font-size: 20pt;
      font-weight: bold;
    }
    .absence-card.justified .value { color: #10b981; }
    .absence-card.unjustified .value { color: #ef4444; }
    .absence-card.delays .value { color: #f59e0b; }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }
    .signature-box {
      text-align: center;
    }
    .signature-line {
      border-top: 1px solid #999;
      margin-top: 40px;
      padding-top: 5px;
      font-size: 10pt;
    }
    .appreciation-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 10pt;
    }
    .appreciation-excellent { background: #10b981; color: white; }
    .appreciation-good { background: #3b82f6; color: white; }
    .appreciation-sufficient { background: #f59e0b; color: white; }
    .appreciation-insufficient { background: #ef4444; color: white; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BULLETIN SCOLAIRE</h1>
      <h2>Trimestre ${data.trimester} - Année scolaire ${data.schoolYear}</h2>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>Élève</h3>
        <p>${data.studentName}</p>
      </div>
      <div class="info-box">
        <h3>Classe</h3>
        <p>${data.className}</p>
      </div>
    </div>

    <table class="grades-table">
      <thead>
        <tr>
          <th style="width: 35%">Matière</th>
          <th style="width: 15%; text-align: center">Moyenne</th>
          <th style="width: 15%; text-align: center">Coefficient</th>
          <th style="width: 35%">Observations</th>
        </tr>
      </thead>
      <tbody>
        ${data.grades.map(grade => `
          <tr>
            <td>${grade.subject}</td>
            <td style="text-align: center" class="average">${grade.average.toFixed(2)}/20</td>
            <td style="text-align: center">${grade.coefficient}</td>
            <td>${grade.teacherComment || "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-card">
        <div class="value">${data.generalAverage.toFixed(2)}</div>
        <div class="label">Moyenne générale</div>
      </div>
      <div class="summary-card">
        <div class="value">${data.classAverage.toFixed(2)}</div>
        <div class="label">Moyenne de classe</div>
      </div>
      <div class="summary-card">
        <div class="value">${data.rank}/${data.totalStudents}</div>
        <div class="label">Classement</div>
      </div>
      <div class="summary-card">
        <span class="appreciation-badge appreciation-${appreciation.class}">${appreciation.text}</span>
        <div class="label" style="margin-top: 8px">Appréciation</div>
      </div>
    </div>

    <div class="absences-section">
      <div class="absence-card justified">
        <div class="value">${data.absences.justified}</div>
        <div class="label">Absences justifiées</div>
      </div>
      <div class="absence-card unjustified">
        <div class="value">${data.absences.unjustified}</div>
        <div class="label">Absences non justifiées</div>
      </div>
      <div class="absence-card delays">
        <div class="value">${data.absences.delays}</div>
        <div class="label">Retards</div>
      </div>
    </div>

    <div class="comments-section">
      <div class="comment-box">
        <h4>Appréciation du professeur principal</h4>
        <p>${data.teacherComment || "Pas de commentaire"}</p>
      </div>
      <div class="comment-box">
        <h4>Appréciation du chef d'établissement</h4>
        <p>${data.principalComment || "Pas de commentaire"}</p>
      </div>
    </div>

    <div class="signature-grid">
      <div class="signature-box">
        <div class="signature-line">Signature du professeur principal</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Signature du chef d'établissement</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Signature des parents</div>
      </div>
    </div>

    <div class="footer">
      <p style="font-size: 9pt; color: #666;">
        Document généré automatiquement par iDETUDE - ${new Date().toLocaleDateString("fr-FR")}
      </p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

function getAppreciation(average: number): { text: string; class: string } {
  if (average >= 16) return { text: "Excellent", class: "excellent" };
  if (average >= 14) return { text: "Très Bien", class: "good" };
  if (average >= 12) return { text: "Bien", class: "good" };
  if (average >= 10) return { text: "Assez Bien", class: "sufficient" };
  if (average >= 8) return { text: "Passable", class: "insufficient" };
  return { text: "Insuffisant", class: "insufficient" };
}
