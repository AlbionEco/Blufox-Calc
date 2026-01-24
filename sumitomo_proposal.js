// Import libraries directly (Modern ESM)
import * as docx from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5"; // Fixed: Default import

/**
 * Logic for generating Sumitomo Series Proposals
 */
async function generateSumitomoProposal(btn) {
    btn.textContent = 'Generating...';
    btn.disabled = true;

    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing Sumitomo Proposal PDF...");

    try {
        if (window.updateProgressBar) await window.updateProgressBar(5, "Processing Inputs...");

        // 1. Get Form Inputs
        const quotation_Number = document.getElementById('quotation_Number').value;
        const client_Name = document.getElementById('client_Name').value;
        const date = document.getElementById('date').value;
        const special_Terms = document.getElementById('special_Terms').value;
        const module = document.getElementById('module').value;
        const flowRate = parseFloat(document.getElementById('flowRate').value) || 0;
        const noOfTrain = parseFloat(document.getElementById('noOfTrain').value) || 0;
        const flux = parseFloat(document.getElementById('flux').value) || 0;
        const noOfMembraneTank = parseFloat(document.getElementById('noOfMembraneTank').value) || 0;
        const workingHr = document.getElementById('workingHr').value;
        const offer_Price = parseFloat(document.getElementById('offer_Price').value) || 0;
        const authorized_Person = document.getElementById('authorized_Person').value;
        const treatment_Type = document.getElementById('treatment_Type').value;

        //  Initialize Variables for Calculation & PDF Content
        let membraneSurfaceAreaPerMBR = 0;
        // Perform calculations based on formulas
        if (module == "12B6") {
            membraneSurfaceAreaPerMBR = 6;
        } else if (module == "12B9") {
            membraneSurfaceAreaPerMBR = 9;
        } else if (module == "12B12") {
            membraneSurfaceAreaPerMBR = 12;
        }

        const effectiveFlowRate = flowRate / 20 //hr;
        const perTrainFlowRate = parseFloat(effectiveFlowRate / noOfTrain).toFixed(2);
        const RasPumpFlow = parseFloat((flowRate / 24) * 3).toFixed(2);
        const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
        const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
        const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR
        const TotalMembraneSurfaceArea = parseFloat(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);

        const RequiredTotalFlowrateforpeakflux = parseFloat(flowRate / workingHr).toFixed(2);
        const RequiredBackwashFlowRate = parseFloat(RequiredTotalFlowrateforpeakflux * 1.5).toFixed(2);
        let RequiredtotalAirFlowRate = parseFloat((TotalNumberOfModule * membraneSurfaceAreaPerMBR) * 0.25).toFixed(1);


        let ModuleSize = "";

        if (module == "12B6") {
            ModuleSize = "1300 x 156 x 164"
        } else if (module == "12B9") {
            ModuleSize = "1855 x 156 x 164"
        } else if (module == "12B12") {
            ModuleSize = "2410 x 156 x 164"
        }


        //  Load Images (Async)
        if (window.updateProgressBar) await window.updateProgressBar(15, "Loading Images...");
        const headerImgData = await loadImage('Images for Proposal/header.jpg');
        const footerImgData = await loadImage('Images for Proposal/footer.jpg');


        // 6. Generate PDF
        if (window.updateProgressBar) await window.updateProgressBar(30, "Initializing Document...");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            compress: true,
            unit: "mm",
            format: "a4"
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Define dimensions for Header and Footer
        const headerHeight = 25;
        const footerHeight = 25;

        // Function to Apply Header/Footer to a specific page
        const applyHeaderFooter = () => {
            // Header
            doc.addImage(headerImgData, 'JPEG', 0, 0, pageWidth, headerHeight);
            // Footer
            doc.addImage(footerImgData, 'JPEG', 0, pageHeight - footerHeight, pageWidth, footerHeight);
        };

        //setting date in dd-mm-yyyy format
        function formatToDDMMYYYY(dateString) {
            const [year, month, day] = dateString.split("-");
            return `${day}-${month}-${year}`;
        }
        const formattedDate = formatToDDMMYYYY(date);

        // --- Content Generation ---

        // NOTE: We start content Y position *below* the header height
        if (window.updateProgressBar) await window.updateProgressBar(40, "Creating Page 1...");

        // ---------------------------------Page 1 ---------------------------------
        let currentY = headerHeight + 15;

        // Ref and To section
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Ref: ", 25, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`${quotation_Number}`, 33, currentY);

        doc.setFont("helvetica", "bold");
        doc.text("Date: ", pageWidth - 80, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(formattedDate, pageWidth - 68, currentY);
        currentY += 6; //41 total

        //add blockheight for To section
        doc.setFont("helvetica", "bold");
        doc.text("To:", 25, currentY);
        currentY += 6; //47 total
        doc.setFont("helvetica", "normal");
        const clientLines = doc.splitTextToSize(client_Name, 160);
        doc.text(clientLines, 25, currentY);
        const blockHeight = clientLines.length * 5;
        //what is 6 here?
        currentY += blockHeight;
        currentY += 10;

        // heading proposal
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Proposal:", 25, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`: Techno Commercial offer for SUMITOMO Hollow Fibre - MBR Membranes ${flowRate}KLD ${treatment_Type}`, 47, currentY);
        currentY += 10;

        // Image Section
        var img = new Image()
        img.src = 'Images for Proposal/Sumitomo img 1.jpg'
        //currentY, width, height
        doc.addImage(img, 'jpeg', 35, currentY, 150, 60);
        currentY += 70;

        //features section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Product Features:', 25, currentY);
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);

        const leftX = 30;
        const bulletX = 26;
        const maxWidth = 165;
        const lineGap = 4;

        // Raw text with **bold markers**
        const rawPoints = [
            "**Energy saving:** Proprietary aeration system efficiently scours membranes, significantly reducing aeration energy. Large membrane surface area per projection area minimizes installation space.",
            "**Durability:** High tensile strength Poreflon hollow fibre resists shaking and flexing, ensuring long-term operational life.",
            "**Wide wastewater compatibility:** Stable treatment performance even with oil-contaminated and refractory organic wastewater.",
            "**Chemical resistance:** Can be chemically cleaned across full pH range (0–14), including high-concentration alkalis, with excellent flow rate recovery.",
            "**Easy handling:** Hydrophilic-treated PTFE hollow fibres allow easy dry transport and installation.",
            "**Zero Sludge Discharge capability:** High volumetric loading, low sludge loading, long sludge age, and infinite sludge age operation enable theoretically zero sludge release.",
            "**Improved degradation efficiency:** Extended sludge age significantly enhances degradation of refractory organic compounds."
        ];

        rawPoints.forEach(raw => {
            currentY += lineGap;

            // Bullet
            doc.setFont("helvetica", "normal");
            doc.text("•", bulletX, currentY);

            // Extract bold and normal parts
            const match = raw.match(/\*\*(.*?)\*\*(.*)/);
            const boldText = match ? match[1] : "";
            const normalText = match ? match[2].trim() : raw;

            // Start position for both bold and normal text
            let textX = leftX;

            // Bold part
            doc.setFont("helvetica", "bold");
            doc.text(boldText, textX, currentY);

            const boldWidth = doc.getTextWidth(boldText);

            // Normal text starts immediately after bold
            doc.setFont("helvetica", "normal");
            const startX = textX + boldWidth + 2;

            const wrapped = doc.splitTextToSize(normalText, maxWidth - (boldWidth + 2));

            // First line
            doc.text(wrapped[0], startX, currentY, { align: "justify" });

            // Next lines → start from bullet text line start (NOT title indent)
            for (let i = 1; i < wrapped.length; i++) {
                currentY += lineGap;
                doc.text(wrapped[i], leftX, currentY, { maxWidth: maxWidth, align: "justify" });
            }

            currentY += lineGap;
        });



        if (window.updateProgressBar) await window.updateProgressBar(50, "Creating Pages 2-6...");
        //---------------------------------------Page 1 End -------------------------------------------------
        // -----------------------------------------------Page 2 ---------------------------------
        // 1. Force a new page
        doc.addPage();

        currentY = headerHeight + 15;
        // Image Section
        var img2 = new Image()
        img2.src = 'Images for Proposal/Sumitomo img 2.jpg'
        doc.addImage(img2, 'jpeg', 25, currentY, 165, 80);
        currentY += 90;


        //Heading
        //Applications section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Application:', 25, currentY);
        currentY += 5; //195 total
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const applications = [
            '• Domestic, Sewage water treatment',
            '• Chemical, textile wastewater treatment',
            '• Electronic wastewater treatment',
            '• Garbage wastewater treatment',
            '• Bio-chemical wastewater treatment',
            '• High concentration organic wastewater',
            '• High SS wastewater treatment ',
        ];
        applications.forEach(application => {
            currentY += 5;
            doc.text(application, 30, currentY);
        });




        // ---------------------------------------Page 2 End -------------------------------------------------
        // ---------------------------------Page 3 Start ---------------------------------

        // 1. Force a new page
        doc.addPage();

        currentY = headerHeight + 15;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('MBR Working Cycle Programming:', 25, currentY);
        currentY += 5; //45 total
        //Image
        var img4 = new Image()
        img4.src = 'Images for Proposal/MBR working cycle programming.jpg'
        doc.addImage(img4, 'jpeg', 25, currentY, 160, 30);


        currentY += 40;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Step Chart Pump and Valve Condition:', 25, currentY);
        currentY += 5; //45 total
        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.autoTable({
            startY: currentY,
            head: [['Step', 'Permeate Pump', 'Backwash Pump', 'Produced Water Valve', 'Backwash Valve', 'Air Inlet Valve', 'Citric Dosing Pump', 'NaClO Dosing Pump']],
            body: [
                ['Permeate', 'Open', ' ', 'Open', ' ', 'Open', ' ', ' '],
                ['Backwash', ' ', 'Open', ' ', 'Open', 'Open', ' ', ' '],
                ['CEB NaClO', ' ', 'Open', ' ', 'Open', 'Open', ' ', 'Open'],
                ['CEB Citric Acid', ' ', 'Open', ' ', 'Open', 'Open', 'Open', ' '],
            ],

            // TABLE WIDTH FIXED = 165mm
            tableWidth: 165,
            margin: { left: 25 },
            theme: 'grid',

            // HEADER STYLE – BOLD
            // header style fill color white and font color sky blue


            headStyles: { fillColor: [255, 255, 255], textColor: [0, 191, 255], fontStyle: 'bold', halign: 'center', lineColor: [204, 204, 204], lineWidth: 0.1 },

            // BODY STYLE – NORMAL + LEFT ALIGN
            styles: { fontStyle: 'normal', halign: 'center', textColor: 0 },
        });

        currentY = doc.lastAutoTable.finalY + 5;


        // ---------------------------------------Page 3 End -------------------------------------------------
        //-----------------------------------------Page 4 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Product Parameter:', 25, currentY);
        currentY += 5;

        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");

        doc.autoTable({
            startY: currentY,
            head: [
                [
                    { content: 'Model No.', rowSpan: 2, colSpan: 3, styles: { halign: 'center', valign: 'middle' } },
                    { content: 'SPMW', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold' } }
                ],
                [
                    '12B6', '12B9', '12B12', '12B38', '12B57'
                ]
            ],

            body: [

                // ===== Membrane =====
                [
                    { content: 'Membrane', rowSpan: 6, styles: { valign: 'middle', halign: 'center' } },
                    'Nominal pore size', 'µm', '0.1', '0.1', '0.1', '0.1', '0.1'
                ],
                ['Inner diameter', 'mm', '1.1', '1.1', '1.1', '1.1', '1.1'],
                ['Outer diameter', 'mm', '2.3', '2.3', '2.2', '2.3', '2.3'],
                ['Membrane area', 'm²', '6', '9', '12', '38', '57'],
                ['Material', '-',
                    { content: 'PTFE', colSpan: 5, styles: { halign: 'center', fontStyle: 'bold' } }
                ],
                ['Hydrophilic treatment', '-',
                    { content: 'Hydrophilic', colSpan: 5, styles: { halign: 'center' } }
                ],

                // ===== Material =====
                [
                    { content: 'Material', rowSpan: 3, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Cap', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'ABS resin (Joint nut: SUS303)', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    { content: 'Potting', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'Heat- & chemical-resistant epoxy resin', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    { content: 'Supporting bar', colSpan: 2, styles: { halign: 'center' } },
                    { content: 'SUS304', colSpan: 3, styles: { halign: 'center' } },
                    { content: '-', colSpan: 2, styles: { halign: 'center' } },
                ],

                // ===== Dimensions =====
                [
                    { content: 'Dimensions', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    'Length', 'mm', '1300', '1855', '2410', '2200', '3220'
                ],
                [
                    'Bottom section', 'mm',
                    { content: '156 x 164', colSpan: 3, styles: { halign: 'center' } },
                    { content: '50 x 840', colSpan: 2, styles: { halign: 'center' } },
                ],

                // ===== Operation condition =====
                [
                    { content: 'Operation condition', rowSpan: 6, styles: { valign: 'middle', halign: 'center' } },
                    'Filtration Method', '-',
                    { content: 'Suction filtration', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    { content: 'Trans Membrane Pressure', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    'Filtration',
                    { content: '>-60 kPa (-0.6 Bar)', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    'Backwash',
                    { content: '<100 kPa (1.0 Bar)', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    'Maximum temperature limit', '°C',
                    { content: '50', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    'Operating pH range', '-',
                    { content: '0–14', colSpan: 5, styles: { halign: 'center' } }
                ],
                [
                    'Cleaning pH range', '-',
                    { content: '0–14', colSpan: 5, styles: { halign: 'center' } }
                ],
            ],

            styles: {
                fontSize: 11,
                cellPadding: 3,
                valign: 'middle',
                halign: 'center'
            },

            headStyles: {
                fillColor: [200, 220, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold'
            },

            columnStyles: {
                0: { halign: 'center' }, // Category
                1: { halign: 'left' },   // Parameter
                2: { halign: 'center' }  // Unit
            },

            theme: 'grid'
        });




        // UPDATED finalY
        currentY = doc.lastAutoTable.finalY + 5;


        // ---------------------------------------Page 4 End -------------------------------------------------
        //-----------------------------------------Page 5 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Offer Parameter', 25, currentY);
        currentY += 5; //45 total
        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.autoTable({
            startY: currentY,
            head: [['Parameters', 'Unit', 'Range']],
            body: [
                ['Flow Rate of the system', 'KLD', `${flowRate}`],
                ['Effective flow Rate (Considering loss of relax & Backwash)', 'm3/hr', `${effectiveFlowRate.toFixed(2)}`],
                ['Design Frame/Train Qty', 'Nos', `${noOfTrain}`],
                ['Per Frame/Train Flow Rate ', 'm3/hr', `${perTrainFlowRate}`],
                ['Design Flux (Avg.)', 'LMH', `${flux}`],
                ['Total MBR Module Required', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', ''],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', ''],
                ['Permeate Pump Flow @ 12-13m Head', 'm3/hr', `${RequiredTotalFlowrateforpeakflux}`],
                ['Back Wash Pump Flow @ 10m Head ', 'm3/hr', `${RequiredBackwashFlowRate}`],
                ['RAS Pump Flow @ 15m Head ', 'm3/hr', `${RasPumpFlow}`],
            ],

            // TABLE WIDTH FIXED = 165mm
            tableWidth: 165,
            margin: { left: 25 },
            theme: 'grid',

            // HEADER STYLE – BOLD
            headStyles: { fillColor: [169, 169, 169], fontStyle: 'bold', halign: 'left' },

            // BODY STYLE – NORMAL + LEFT ALIGN
            styles: { fontStyle: 'normal', halign: 'left', textColor: 0 },

            // ALTERNATE ROW COLORS   // light gray
            alternateRowStyles: { fillColor: [240, 240, 240] },
            // White row
            bodyStyles: { fillColor: [255, 255, 255] },
        });
        currentY = doc.lastAutoTable.finalY + 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Note:", 25, currentY);
        currentY += 2;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("1. Vertical Distance between the water level in the MBR tank and back wash tank shall not be more than 0.7mtr.",
            30,
            currentY + 5,
            { maxWidth: 165, align: "justify" });
        doc.text("2. Maintain the water level 300-500mm above the MBR frame / Module.",
            30,
            currentY + 15,
            { maxWidth: 165, align: "justify" });
        doc.text("3. Follow the chemicals for CIP & CEB as per manual.",
            30,
            currentY + 20,
            { maxWidth: 165, align: "justify" });
        // ---------------------------------------Page 5 End -------------------------------------------------
        // ---------------------------------------Page 6 Start -------------------------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Typical P&ID', 25, currentY);
        currentY += 5; //45 total
        // Image Section
        var img3 = new Image()
        img3.src = 'Images for Proposal/MembraneP&ID.jpg'
        doc.addImage(img3, 'jpeg', 20, currentY, 180, 215);
        // ---------------------------------------Page 6 End -------------------------------------------------
        //----------------------------------------Page 7 Start -----------------------------------------------

        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;


        //currentY += 15;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Commercial Offer:', 25, currentY);
        currentY += 5; //45 total
        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.autoTable({
            startY: currentY,
            head: [['No.', 'Item', 'Qty.', 'Total Price (Rs.)']],
            body: [
                ['1.', `SUMITOMO® - PTFE MBR membranes 
Plant Capacity: ${flowRate} KLD ${treatment_Type}
with SS304 Skid(Frame)`, `${TotalNumberOfModule}`, `${(offer_Price * TotalNumberOfModule).toLocaleString('en-IN')}/-`],
                ['', '', 'Total Price (Rs.)', `${(offer_Price * TotalNumberOfModule).toLocaleString('en-IN')}/-`],
            ],

            // TABLE WIDTH FIXED = 165mm
            tableWidth: 165,
            margin: { left: 25 },
            theme: 'grid',

            // HEADER STYLE – BOLD
            headStyles: { fillColor: [169, 169, 169], fontStyle: 'bold', halign: 'center' },

            // BODY STYLE – NORMAL + LEFT ALIGN
            styles: { fontStyle: 'normal', halign: 'left', textColor: 0 },

            //second and third colum align center with bold text
            didParseCell: function (data) {
                if (data.column.index === 2 || data.column.index === 3) {
                    data.cell.styles.halign = 'center';
                    data.cell.styles.fontStyle = 'bold';
                }
            },
        });
        currentY = doc.lastAutoTable.finalY + 5;

        currentY += 5;
        //Heading
        doc.setFontSize(12);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Scope of Supply:', 25, currentY);
        currentY += 5;
        // description 1
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("\u2022  Supply of Membranes Module / only membranes.", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 5;
        doc.text("\u2022  Supply P&ID", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 5;
        doc.text("\u2022  Operation Manual", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 15;

        //Heading
        doc.setFontSize(12);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Exclusion:', 25, currentY);
        currentY += 5;
        // description 1
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("\u2022  Pre-treatment, Biological, Post Treatment", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 5;
        doc.text("\u2022  Control Panel & Instruments.", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 5;
        doc.text("\u2022  Pumps, Blowers, Lifting system etc.", 30, currentY, { maxWidth: 165, align: "justify" });
        currentY += 15;


        // --- PAYMENT TERMS HEADING ---
        doc.setFontSize(12);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Payment Terms and Conditions:', 25, currentY);
        currentY += 7;

        // --- TERMS BULLET POINTS ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const termsConditions = [
            "1)  Ex. work from India, China or Japan which is easy and convince for client  ",
            "2)  Freight & Packing will be charges extra as actual.",
            "3)  Payment 50% Advance and 50% before delivery.",
            "4)  Offer Validity 30 days from offer date.",
            "5)  Installation under client scope only.",
            "6)  Delivery 15-60 days of Purchase Order along with advance payment.",
            "7)  Membrane Warranty will be one year against manufacturing defect only.",
            "8)  Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.",
            "9) Any other terms and conditions will be as per Blufox standard terms and conditions."
        ];

        termsConditions.forEach(term => {
            // 1. Split text to know exactly how many lines it occupies
            let lines = doc.splitTextToSize(term, 165);
            let blockHeight = lines.length * 5;

            // 3. Print the text
            doc.text(lines, 30, currentY); // Indented slightly (30 instead of 25)

            // 4. Update Y
            currentY += blockHeight + 2; // +2 for gap between bullets
        });


        if (window.updateProgressBar) await window.updateProgressBar(90, "Finalizing Document...");

        // ---------------------------------------Page 7 End -------------------------------------------------
        //----------------------------------------Page 8 Start -----------------------------------------------


        // --- HELPER CONFIGURATION ---
        const contentStartX = 25;
        const textWidth = 165;
        const lineHeight = 5; // Approx height per line (adjust based on font size)
        const pageBottomLimit = pageHeight - footerHeight - 10; // Buffer space before footer



        // Function to handle Page Breaks
        function checkPageBreak(requiredSpace) {
            if (currentY + requiredSpace > pageBottomLimit) {
                doc.addPage();
                currentY = headerHeight + 15; // Reset Y position for new page

                // IMPORTANT: CALL YOUR HEADER & FOOTER FUNCTION HERE
                // Example: addHeader(doc); addFooter(doc);
                // If you don't have a function, paste your Header/Footer image logic here.
            }
        }

        // 1. Force a new page for the start of this section
        doc.addPage();
        currentY = headerHeight + 15;


        //currentY += 10; // Gap before Special Terms

        // --- SPECIAL TERMS (Dynamic Length) ---
        if (special_Terms && special_Terms.trim() !== "") {

            // Heading
            doc.setFontSize(14);
            doc.setFont("helvetica", "bolditalic");
            doc.setTextColor(0, 0, 139);
            checkPageBreak(15);
            doc.text('Special Terms and Conditions:', contentStartX, currentY);
            currentY += 7;

            // Content
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0);

            // Split the massive text block into individual lines based on width
            const specialLines = doc.splitTextToSize(special_Terms, textWidth);

            // Loop through EVERY line. This allows the text to break across pages gracefully.
            specialLines.forEach(line => {
                checkPageBreak(lineHeight); // Check if 1 line fits
                doc.text(line, contentStartX, currentY);
                currentY += lineHeight;
            });

            currentY += 10; // Gap after special terms
        }

        // --- SIGNATURE SECTION ---
        // Calculate total height needed for signature block (Heading + Name + Company)
        // Approx height: Heading(6) + Space(8) + Name(6) + Space(8) + Company(6) ~= 35
        const signatureBlockHeight = 40;

        checkPageBreak(signatureBlockHeight);

        // 1. Heading
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 139);
        doc.text('Authorized Signatory', contentStartX, currentY);
        currentY += 8;

        // 2. Name
        doc.text(`${authorized_Person}`, contentStartX, currentY);
        currentY += 8;

        // 3. Company Name
        doc.text('Blufox Ecoventures LLP.', contentStartX, currentY);
        currentY += 15;




        //----------------------------------------Page 8 End -----------------------------------------------

        // --- Final Pass: Add Header and Footer to ALL Pages ---
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            applyHeaderFooter();
        }

        // Save PDF
        if (window.updateProgressBar) await window.updateProgressBar(100, "Download Started!");
        doc.save(`Proposal_${quotation_Number}.pdf`);

    } catch (e) {
        console.error(e);
        alert('Error generating PDF: ' + e.message);
    } finally {
        if (window.hideProgressBar) window.hideProgressBar();
        btn.textContent = 'Generate Proposal PDF';
        btn.disabled = false;
    }
}

























/**
 * Logic for generating Sumitomo Series Word Proposals
 */
async function generateSumitomoWordProposal(btn) {
    btn.textContent = 'Generating Word Doc...';
    btn.disabled = true;

    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing Sumitomo Proposal Word Document...");

    try {
        if (window.updateProgressBar) await window.updateProgressBar(5, "Processing Form Data...");

        // --- 1. Gather Data (Exact same logic as PDF) ---
        const quotation_Number = document.getElementById('quotation_Number').value;
        const client_Name = document.getElementById('client_Name').value;
        const date = document.getElementById('date').value;
        const special_Terms = document.getElementById('special_Terms').value;
        const module = document.getElementById('module').value;
        const flowRate = parseFloat(document.getElementById('flowRate').value) || 0;
        const noOfTrain = parseFloat(document.getElementById('noOfTrain').value) || 0;
        const flux = parseFloat(document.getElementById('flux').value) || 0;
        const noOfMembraneTank = parseFloat(document.getElementById('noOfMembraneTank').value) || 0;
        const workingHr = document.getElementById('workingHr').value;
        const offer_Price = parseFloat(document.getElementById('offer_Price').value) || 0;
        const authorized_Person = document.getElementById('authorized_Person').value;
        const treatment_Type = document.getElementById('treatment_Type').value;

        let membraneSurfaceAreaPerMBR = 0;
        if (module == "12B6") {
            membraneSurfaceAreaPerMBR = 6;
        } else if (module == "12B9") {
            membraneSurfaceAreaPerMBR = 9;
        } else if (module == "12B12") {
            membraneSurfaceAreaPerMBR = 12;
        }

        const effectiveFlowRate = flowRate / 20;
        const perTrainFlowRate = parseFloat(effectiveFlowRate / noOfTrain).toFixed(2);
        const RasPumpFlow = parseFloat((flowRate / 24) * 3).toFixed(2);
        const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
        const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
        const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR;
        const TotalMembraneSurfaceArea = parseFloat(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);
        const RequiredTotalFlowrateforpeakflux = parseFloat(flowRate / workingHr).toFixed(2);
        const RequiredBackwashFlowRate = parseFloat(RequiredTotalFlowrateforpeakflux * 1.5).toFixed(2);
        let RequiredtotalAirFlowRate = parseFloat((TotalNumberOfModule * membraneSurfaceAreaPerMBR) * 0.25).toFixed(1);


        let ModuleSize = "";
        if (module == "12B6") {
            ModuleSize = "1300 x 156 x 164"
        } else if (module == "12B9") {
            ModuleSize = "1855 x 156 x 164"
        } else if (module == "12B12") {
            ModuleSize = "2410 x 156 x 164"
        }
        function formatToDDMMYYYY(dateString) {
            const [year, month, day] = dateString.split("-");
            return `${day}-${month}-${year}`;
        }
        const formattedDate = formatToDDMMYYYY(date);

        // --- 2. Load Images & Convert to Uint8Array for docx ---
        if (window.updateProgressBar) await window.updateProgressBar(20, "Loading Image Assets...");

        // Using existing helper `loadImage` then converting to ArrayBuffer
        const headerDataUrl = await loadImage('Images for Proposal/header.jpg');
        const footerDataUrl = await loadImage('Images for Proposal/footer.jpg');
        const Sumitomoimg1 = await loadImage('Images for Proposal/Sumitomo img 1.jpg');
        const pidImgDataUrl = await loadImage('Images for Proposal/MembraneP&ID.jpg');
        const Sumitomoimg2 = await loadImage('Images for Proposal/Sumitomo img 2.jpg');
        const cycleImgDataUrl = await loadImage('Images for Proposal/MBR working cycle programming.jpg');

        const headerBuffer = base64ToUint8Array(headerDataUrl);
        const footerBuffer = base64ToUint8Array(footerDataUrl);
        const sumitomoImg1Buffer = base64ToUint8Array(Sumitomoimg1);
        const pidImgBuffer = base64ToUint8Array(pidImgDataUrl);
        const sumitomoImg2Buffer = base64ToUint8Array(Sumitomoimg2);
        const cycleImgBuffer = base64ToUint8Array(cycleImgDataUrl);

        // --- 3. Construct Word Document ---
        if (window.updateProgressBar) await window.updateProgressBar(40, "Building Document Structure...");

        const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, WidthType, BorderStyle, Header, Footer, AlignmentType, PageBreak, VerticalAlign, HeightRule } = docx;

        // --- Helper for Tables ---
        const createTable = (headers, rows) => {
            return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                },
                rows: [
                    new TableRow({
                        children: headers.map(h => new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })],
                                alignment: AlignmentType.CENTER
                            })],
                            shading: { fill: "A9A9A9" },
                            verticalAlign: VerticalAlign.CENTER,
                            // 2. ADD LEFT/RIGHT MARGIN (PADDING)
                            margins: {
                                left: 100, // ~1.7mm padding
                                right: 100,
                                top: 40,
                                bottom: 30,
                            }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST }, // 0.8cm
                        // alignment of the text inside the table row must be center vertically
                        verticalAlign: VerticalAlign.CENTER,
                    }),
                    ...rows.map((row, i) => new TableRow({
                        children: row.map(cellText => new TableCell({
                            children: [new Paragraph({ text: cellText ? String(cellText) : "" })],
                            shading: { fill: i % 2 === 0 ? "FFFFFF" : "F0F0F0" },
                            // 2. ADD LEFT/RIGHT MARGIN (PADDING)
                            margins: {
                                left: 100, // ~1.7mm padding
                                right: 100,
                                top: 40,
                                bottom: 30,
                            }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST }, // 0.8cm
                        verticalAlign: VerticalAlign.CENTER,
                    })),
                ]
            });
        };


        const createBlueHeaderTable = (input) => {

            const rows = Array.isArray(input) ? input : input?.rows || ['.'];

            return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                },

                rows: rows.map((row, rowIndex) => {
                    const isHeaderRow = rowIndex <= 1;

                    // SAFE cell access
                    const cells = row.options?.children || row.children || [];

                    return new TableRow({
                        children: cells.map((cell) => {

                            return new TableCell({
                                ...cell.options,     // 🔒 structure preserved

                                // ✅ REUSE ORIGINAL CONTENT (NO CLONING)
                                //children: cell.options?.children || cell.children || [new Paragraph("")],
                                children: (cell.options?.children || cell.children || [new Paragraph()]),

                                verticalAlign: VerticalAlign.CENTER,
                                alignment: AlignmentType.CENTER,
                                // ===== Styling only =====
                                shading: {
                                    fill: isHeaderRow
                                        ? "C8DCF0" // Blue header
                                        : "FFFFFF"
                                },

                                //bold content for header row
                                styles: {
                                    fontStyle: isHeaderRow ? "bold" : "normal"
                                },



                                margins: {
                                    left: 100,
                                    right: 100,
                                    top: 80,    
                                    bottom: 80,
                                }
                            });
                        }),

                        verticalAlign: VerticalAlign.CENTER,
                    });
                })
            });
        };






        const createStepTable = (headers, rows) => {
            return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                // 1. SET BORDER COLOR TO GRAY
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "D3D3D3" },
                },
                rows: [
                    new TableRow({
                        children: headers.map(h => new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: h, bold: true, color: "00BFFF" })],
                                alignment: AlignmentType.CENTER
                            })],
                            shading: { fill: "FFFFFF" },
                            verticalAlign: VerticalAlign.CENTER,
                            // 2. ADD LEFT/RIGHT MARGIN (PADDING)
                            margins: {
                                left: 100, // ~1.7mm padding
                                right: 100,
                                top: 40,
                                bottom: 30,
                            }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST },
                        verticalAlign: VerticalAlign.CENTER,
                    }),
                    ...rows.map(row => new TableRow({
                        children: row.map(cellText => new TableCell({
                            children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })],
                            // 2. ADD LEFT/RIGHT MARGIN (PADDING)
                            margins: {
                                left: 100, // ~1.7mm padding
                                right: 100,
                                top: 40,
                                bottom: 30,
                            }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST },
                        verticalAlign: VerticalAlign.CENTER,
                    }))
                ]
            });
        }

        const sections = [];

        // Spacer for 3 lines (Size 11)
        const spacer = [
            new Paragraph({ text: "" })
        ];

        // Common Header/Footer for sections
        // FIX: Using negative indent to make it full width and removing default spacing
        // Approx 1440 TWIPs = 1 inch.
        const docHeader = new Header({
            children: [
                new Paragraph({
                    children: [new ImageRun({
                        data: headerBuffer,
                        transformation: { width: 795, height: 100 } // Width approx A4 pixel width
                    })],
                    indent: { left: -1440, right: -1440 }, // Pull outside margins
                    spacing: { before: 0, after: 0 }
                })
            ]
        });

        const docFooter = new Footer({
            children: [
                new Paragraph({
                    children: [new ImageRun({
                        data: footerBuffer,
                        transformation: { width: 795, height: 100 }
                    })],
                    indent: { left: -1440, right: -1440 }, // Pull outside margins
                    spacing: { before: 0, after: 0 }
                })
            ]
        });

        if (window.updateProgressBar) await window.updateProgressBar(50, "Generating Content Pages...");

        // --- Page 1 Content ---
        const page1Children = [
            ...spacer,
            new Paragraph({
                children: [
                    new TextRun({ text: "Ref: ", bold: true }),
                    new TextRun({ text: quotation_Number }),
                    new TextRun({ text: "\t\t\t\t\t\tDate: ", bold: true }),
                    new TextRun({ text: formattedDate })
                ], spacing: { line: 380 }
            }),
            new Paragraph({ children: [new TextRun({ text: "To:", bold: true })] }),
            //if Client name input has enter then split into multiple lines
            ...client_Name.split('\n').map(line => new Paragraph({ text: line })),
            new Paragraph({ text: "" }), // Space
            new Paragraph({
                children: [
                    new TextRun({ text: "Proposal: ", bold: true, size: 24 }),
                    new TextRun({ text: `Techno Commercial offer for SUMITOMO Hollow Fibre - MBR Membranes  ${flowRate}KLD ${treatment_Type}`, size: 24 })
                ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new ImageRun({ data: sumitomoImg1Buffer, transformation: { width: 500, height: 200 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "Product Features", bold: true, italics: true, color: "00008B", size: 28 })]
            }),
            new Paragraph({ text: "" }),
            // Use indent property for bullet point indentation in Word output
            new Paragraph({
                children: [
                    new TextRun({ text: "• Energy saving: ", bold: true, size: 24 }),
                    new TextRun({ text: "Proprietary aeration system efficiently scours membranes, significantly reducing aeration energy. Large membrane surface area per projection area minimizes installation space.", size: 24 })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "• Durability: ", bold: true, size: 24 }),
                    new TextRun({ text: "High tensile strength Poreflon hollow fibre resists shaking and flexing, ensuring long-term operational life.", size: 24 })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: "• Wide wastewater compatibility: ", bold: true, size: 24 }),
                    new TextRun({ text: "Stable treatment performance even with oil-contaminated and refractory organic wastewater.", size: 24 })
                ]
            }), new Paragraph({
                children: [
                    new TextRun({ text: "• Chemical resistance: ", bold: true, size: 24 }),
                    new TextRun({ text: "Can be chemically cleaned across full pH range (0–14), including high-concentration alkalis, with excellent flow rate recovery.", size: 24 })
                ]
            }), new Paragraph({
                children: [
                    new TextRun({ text: "• Easy handling: ", bold: true, size: 24 }),
                    new TextRun({ text: "Hydrophilic-treated PTFE hollow fibres allow easy dry transport and installation.", size: 24 })
                ]
            }), new Paragraph({
                children: [
                    new TextRun({ text: "• Zero Sludge Discharge capability: ", bold: true, size: 24 }),
                    new TextRun({ text: "High volumetric loading, low sludge loading, long sludge age, and infinite sludge age operation enable theoretically zero sludge release.", size: 24 })
                ]
            }), new Paragraph({
                children: [
                    new TextRun({ text: "• Improved degradation efficiency: ", bold: true, size: 24 }),
                    new TextRun({ text: "Extended sludge age significantly enhances degradation of refractory organic compounds.", size: 24 })
                ]
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 1
        ];

        // --- Page 2 Content ---
        const page2Children = [
            ...spacer,

            new Paragraph({ children: [new TextRun({ text: "MBR Membranes GA Drawing", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({
                children: [new ImageRun({ data: sumitomoImg2Buffer, transformation: { width: 600, height: 300 } })],
                alignment: AlignmentType.CENTER
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "Application:", bold: true, italics: true, color: "00008B", size: 28 })]
            }),
            new Paragraph({ text: "" }),
            // Use indent property for bullet point indentation in Word output
            new Paragraph({ text: "• Domestic, Sewage water treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• Chemical, textile wastewater treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• Electronic wastewater treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• Garbage wastewater treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• Bio-chemical wastewater treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• High concentration organic wastewater", indent: { left: 350 } }),
            new Paragraph({ text: "• High SS wastewater treatment ", indent: { left: 350 } }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 2
        ];


        // --- Page 3 Content ---
        const page3Children = [
            ...spacer,

            new Paragraph({ children: [new TextRun({ text: "MBR Working Cycle Programming:", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({
                children: [new ImageRun({ data: cycleImgBuffer, transformation: { width: 650, height: 120 } })]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "Step Chart Pump and Valve Condition:", bold: true, italics: true, color: "00008B", size: 28 })] }),
            createStepTable(
                ['Step', 'Permeate Pump', 'Backwash Pump', 'Produced Water Valve', 'Backwash Valve', 'Air Inlet Valve', 'Citric Dosing Pump', 'NaClO Dosing Pump'],
                [
                    ['Permeate', 'Open', ' ', 'Open', ' ', 'Open', ' ', ' '],
                    ['Backwash', ' ', 'Open', ' ', 'Open', 'Open', ' ', ' '],
                    ['CEB NaClO', ' ', 'Open', ' ', 'Open', 'Open', ' ', 'Open'],
                    ['CEB Citric Acid', ' ', 'Open', ' ', 'Open', 'Open', 'Open', ' '],
                ]
            ),

            new Paragraph({ children: [new PageBreak()] }) // End Page 3
        ];

        // --- Page 4 Content ---
        const page4Children = [
            ...spacer,

            new Paragraph({
                children: [
                    new TextRun({
                        text: "Product Parameter:",
                        bold: true,
                        italics: true,
                        color: "00008B",
                        size: 28
                    })
                ]
            }),

            createBlueHeaderTable({
                width: {
                    size: 100, type: WidthType.PERCENTAGE,
                },
                rows: [
    // ===== HEADER =====
    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [
                    new TextRun({
                        text: "Model No.",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER , bold: true })],
                rowSpan: 2,
                columnSpan: 3
            }),
            new TableCell({
                children: [new Paragraph({ children: [
                    new TextRun({
                        text: "SPMW",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true })],
                columnSpan: 5
            })
        ]
    }),
    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ children: [
                    new TextRun({
                        text: "12B6",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true })] }),
            new TableCell({ children: [new Paragraph({ children: [
                    new TextRun({
                        text: "12B9",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true  })] }),
            new TableCell({ children: [new Paragraph({ children: [
                    new TextRun({
                        text: "12B12",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true  })] }),
            new TableCell({ children: [new Paragraph({ children: [
                    new TextRun({
                        text: "12B38",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true  })] }),
            new TableCell({ children: [new Paragraph({ children: [
                    new TextRun({
                        text: "12B57",
                        bold: true,
                        size: 24
                    })
                ], alignment: AlignmentType.CENTER, bold: true  })] }),
        ]
    }),

    // ===== MEMBRANE =====
    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Membrane", alignment: AlignmentType.CENTER })],
                rowSpan: 6
            }),
            new TableCell({ children: [new Paragraph({ text: "Nominal pore size", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "µm", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "0.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "0.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "0.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "0.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "0.1", alignment: AlignmentType.CENTER })] }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Inner diameter", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "mm", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1.1", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1.1", alignment: AlignmentType.CENTER })] }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Outer diameter", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "mm", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2.3", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2.3", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2.2", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2.3", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2.3", alignment: AlignmentType.CENTER })] }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Membrane area", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "m²", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "6", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "9", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "12", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "38", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "57", alignment: AlignmentType.CENTER })] }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Material", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "PTFE", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Hydrophilic treatment", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "Hydrophilic", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    // ===== MATERIAL =====
    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Material", alignment: AlignmentType.CENTER })],
                rowSpan: 3
            }),
            new TableCell({
                children: [new Paragraph({ text: "Cap", alignment: AlignmentType.CENTER })],
                columnSpan: 2
            }),
            new TableCell({
                children: [new Paragraph({ text: "ABS resin (Joint nut: SUS303)", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Potting", alignment: AlignmentType.CENTER })],
                columnSpan: 2
            }),
            new TableCell({
                children: [new Paragraph({ text: "Heat- & chemical-resistant epoxy resin", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Supporting bar", alignment: AlignmentType.CENTER })],
                columnSpan: 2
            }),
            new TableCell({
                children: [new Paragraph({ text: "SUS304", alignment: AlignmentType.CENTER })],
                columnSpan: 3
            }),
            new TableCell({
                children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })],
                columnSpan: 2
            }),
        ]
    }),

    // ===== DIMENSIONS =====
    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Dimensions", alignment: AlignmentType.CENTER })],
                rowSpan: 2
            }),
            new TableCell({ children: [new Paragraph({ text: "Length", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "mm", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1300", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "1855", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2410", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "2200", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "3220", alignment: AlignmentType.CENTER })] }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Bottom section", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "mm", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "156 x 164", alignment: AlignmentType.CENTER })],
                columnSpan: 3
            }),
            new TableCell({
                children: [new Paragraph({ text: "50 x 840", alignment: AlignmentType.CENTER })],
                columnSpan: 2
            }),
        ]
    }),

    // ===== OPERATION CONDITION =====
    new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ text: "Operation condition", alignment: AlignmentType.CENTER })],
                rowSpan: 6
            }),
            new TableCell({ children: [new Paragraph({ text: "Filtration Method", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "Suction filtration", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Trans Membrane Pressure", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Filtration", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: ">-60 kPa (-0.6 Bar)", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Backwash", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "<100 kPa (1.0 Bar)", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Maximum temperature limit", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "°C", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "50", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Operating pH range", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "0–14", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),

    new TableRow({
        children: [
            new TableCell({ children: [new Paragraph({ text: "Cleaning pH range", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "-", alignment: AlignmentType.CENTER })] }),
            new TableCell({
                children: [new Paragraph({ text: "0–14", alignment: AlignmentType.CENTER })],
                columnSpan: 5
            }),
        ]
    }),
                ]
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 4
        ];

        // --- Page 5 Content ---
        const page5Children = [
            ...spacer,


            new Paragraph({ children: [new TextRun({ text: "Offer Parameter", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),
            createTable(['Parameters', 'Unit', 'Range'], [
                ['Flow Rate of the system', 'KLD', `${flowRate}`],
                ['Effective flow Rate (Considering loss of relax & Backwash)', 'm3/hr', `${effectiveFlowRate.toFixed(2)}`],
                ['Design Frame/Train Qty', 'Nos', `${noOfTrain}`],
                ['Per Frame/Train Flow Rate ', 'm3/hr', `${perTrainFlowRate}`],
                ['Design Flux (Avg.)', 'LMH', `${flux}`],
                ['Total MBR Module Required', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', ''],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', ''],
                ['Permeate Pump Flow @ 12-13m Head', 'm3/hr', `${RequiredTotalFlowrateforpeakflux}`],
                ['Back Wash Pump Flow @ 10m Head ', 'm3/hr', `${RequiredBackwashFlowRate}`],
                ['RAS Pump Flow @ 15m Head ', 'm3/hr', `${RasPumpFlow}`],
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Note:", bold: true })] }),
            new Paragraph({ text: "1. Vertical Distance between the water level in the MBR tank and back wash tank shall not be more than 0.7mtr", indent: { left: 350 } }),
            new Paragraph({
                text: "2. Maintain the water level 300-500mm above the MBR frame / Module.", indent: { left: 350 }
            }),
            new Paragraph({
                text: "3. Follow the chemicals for CIP & CEB as per manual.", indent: { left: 350 }
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 5
        ];

        // --- Page 6 Content ---
        const page6Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "Typical P&ID", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({
                children: [new ImageRun({ data: pidImgBuffer, transformation: { width: 600, height: 800 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 6
        ];

        // --- Page 7 Content ---

        const page7Children = [
            ...spacer,

            new Paragraph({ children: [new TextRun({ text: "Commercial Offer:", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                },
                rows: [
                    // --- Header Row ---
                    new TableRow({
                        children: ['No.', 'Item', 'Qty.', 'Total Price (Rs.)'].map(text => new TableCell({
                            children: [new Paragraph({
                                children: [new TextRun({ text: text, bold: true, color: "FFFFFF" })],
                                alignment: AlignmentType.CENTER
                            })],
                            shading: { fill: "A9A9A9" }, // Gray Header
                            verticalAlign: VerticalAlign.CENTER,
                            margins: { left: 100, right: 100 }
                        })),
                        height: { value: 445, rule: HeightRule.AT_LEAST }
                    }),

                    // --- Data Row 1 ---
                    new TableRow({
                        children: [
                            // Col 1: No.
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: "1.", bold: true })],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                            // Col 2: Item (With Line Breaks)
                            new TableCell({
                                children: [new Paragraph({
                                    children: [
                                        new TextRun({ text: " SUMITOMO® - PTFE MBR Membranes " }),
                                        // break: 1 creates a new line within the same cell
                                        new TextRun({ text: `Plant Capacity: ${flowRate} KLD ${treatment_Type}`, break: 1 }),
                                        new TextRun({ text: "with SS304 Frame Including", break: 1 }),
                                    ],
                                    alignment: AlignmentType.LEFT
                                })],
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                            // Col 3: Qty (Centered & Bold)
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: `${TotalNumberOfModule}`, bold: true })],
                                    alignment: AlignmentType.CENTER
                                })],
                                verticalAlign: VerticalAlign.CENTER,
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                            // Col 4: Price (Centered & Bold)
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: `${(offer_Price * TotalNumberOfModule).toLocaleString('en-IN')}/-`, bold: true })],
                                    alignment: AlignmentType.CENTER
                                })],
                                verticalAlign: VerticalAlign.CENTER,
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                        ],
                        height: { value: 445, rule: HeightRule.AT_LEAST }
                    }),

                    // --- Data Row 2 (Total) ---
                    new TableRow({
                        children: [
                            new TableCell({ children: [], shading: { fill: "FFFFFF" } }), // Empty
                            new TableCell({ children: [], shading: { fill: "FFFFFF" } }), // Empty
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: "Total Price (Rs.)", bold: true })],
                                    alignment: AlignmentType.CENTER
                                })],
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                            new TableCell({
                                children: [new Paragraph({
                                    children: [new TextRun({ text: `${(offer_Price * TotalNumberOfModule).toLocaleString('en-IN')}/-`, bold: true })],
                                    alignment: AlignmentType.CENTER
                                })],
                                shading: { fill: "FFFFFF" }, // White Background
                                margins: { left: 100, right: 100 }
                            }),
                        ],
                        height: { value: 445, rule: HeightRule.AT_LEAST }
                    })
                ]
            }),
            new Paragraph({ text: "" }),
            // line height exactly 400 TWIPs (~14pt) for spacing
            new Paragraph({ children: [new TextRun({ text: "Scope of Supply:", bold: true, italics: true, color: "00008B", size: 26 })], spacing: { line: 380 } }),
            new Paragraph({ text: "• Supply of Membranes Module / only membranes.", indent: { left: 350 } }),
            new Paragraph({ text: "• Supply P&ID", indent: { left: 350 } }),
            new Paragraph({ text: "• Operation Manual", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "Exclusion:", bold: true, italics: true, color: "00008B", size: 26 })], spacing: { line: 380 } }),
            new Paragraph({ text: "• Pre-treatment, Biological, Post Treatment", indent: { left: 350 } }),
            new Paragraph({ text: "• Control Panel & Instruments.", indent: { left: 350 } }),
            new Paragraph({ text: "• Pumps, Blowers, Lifting system etc.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "Payment Terms and Conditions:", bold: true, italics: true, color: "00008B", size: 26 })], spacing: { line: 380 } }),
            new Paragraph({ text: "1)  Above Prices ex. work only.", indent: { left: 350 } }),
            new Paragraph({ text: "2)  GST 18 % will be extra.", indent: { left: 350 } }),
            new Paragraph({ text: "3)  Freight & Packing will be charges extra as actual.", indent: { left: 350 } }),
            new Paragraph({ text: "4)  Payment 50% Advance and 50% before delivery.", indent: { left: 350 } }),
            new Paragraph({ text: "5)  Offer Validity 30 days from offer date.", indent: { left: 350 } }),
            new Paragraph({ text: "6)  Installation under client scope only.", indent: { left: 350 } }),
            new Paragraph({ text: "7)  Delivery 15-60 days of Purchase Order along with advance payment.", indent: { left: 350 } }),
            new Paragraph({ text: "8)  Membrane Warranty will be one year against manufacturing defect only.", indent: { left: 350 } }),
            new Paragraph({ text: "9)  Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.", indent: { left: 350 } }),
            new Paragraph({ text: "10) Any other terms and conditions will be as per Blufox standard terms and conditions.", indent: { left: 350 } }),

        ];

        // --- Page 8 Content ---     
        const page8Children = [];
        page8Children.push(...spacer);

        if (special_Terms && special_Terms.trim() !== "") {
            page8Children.push(new Paragraph({ children: [new TextRun({ text: "Special Terms and Conditions:", bold: true, italics: true, color: "00008B", size: 28 })] }));
            page8Children.push(new Paragraph({ text: special_Terms }));
            page8Children.push(new Paragraph({ text: "" }));
        }

        page8Children.push(new Paragraph({ children: [new TextRun({ text: "Authorized Signatory", bold: true, color: "00008B", size: 24 })] }));
        page8Children.push(new Paragraph({ children: [new TextRun({ text: authorized_Person, bold: true, color: "00008B", size: 24 })] }));
        page8Children.push(new Paragraph({ children: [new TextRun({ text: "Blufox Ecoventures LLP.", bold: true, color: "00008B", size: 24 })] }));
        page8Children.push(new Paragraph({ text: "" }));


        // --- Assemble Document ---
        if (window.updateProgressBar) await window.updateProgressBar(80, "Finalizing Word Document...");

        const finalChildren = [
            ...page1Children,
            ...page2Children,
            ...page3Children,
            ...page4Children,
            ...page5Children,
            ...page6Children,
            ...page7Children,
            ...page8Children,
        ];

        const docObj = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Helvetica",
                            size: 22,
                            color: "000000",
                        },
                        paragraph: {
                            spacing: {
                                line: 300, // 15pt = 300 twips
                                lineRule: "auto", // "auto" tells Word to treat 276 as a relative ratio
                                after: 0,
                                before: 0,
                            }, // REMOVE DEFAULT SPACING
                            //alignment set to justified
                            alignment: AlignmentType.JUSTIFIED,
                            //line spacing 15pt
                        },
                    },
                },
            },
            sections: [{
                headers: {
                    default: docHeader,
                },
                footers: {
                    default: docFooter,
                },
                properties: {
                    page: {
                        margin: {
                            header: 0, // Header from top = 0cm
                            footer: 0, // Footer from bottom = 0cm
                            top: 1440, // Body starts at 1 inch
                            bottom: 1440,
                            left: 1440,
                            right: 1440
                        }
                    }
                },
                children: finalChildren
            }]
        });

        // --- 4. Save ---
        if (window.updateProgressBar) await window.updateProgressBar(95, "Saving File...");
        const blob = await Packer.toBlob(docObj);
        saveAs(blob, `Proposal_${quotation_Number}.docx`);
        if (window.updateProgressBar) await window.updateProgressBar(100, "Download Started!");

    } catch (e) {
        console.error(e);
        alert('Error generating Word Doc: ' + e.message);
    } finally {
        if (window.hideProgressBar) window.hideProgressBar();
        btn.textContent = 'Generate Proposal Word';
        btn.disabled = false;
    }
}

// Attach functions to window so the HTML buttons can find them
window.generateSumitomoProposal = generateSumitomoProposal;
window.generateSumitomoWordProposal = generateSumitomoWordProposal;