// Import libraries directly (Modern ESM)
import * as docx from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5"; // Fixed: Default import

/**
 * Logic for generating 500D Series Proposals
 */
async function generate500DProposal(btn) {
    btn.textContent = 'Generating...';
    btn.disabled = true;

    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing 500D Proposal PDF...");

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
        const workingHr = document.getElementById('workingHr').value;
        const offer_Price = parseFloat(document.getElementById('offer_Price').value) || 0;
        const authorized_Person = document.getElementById('authorized_Person').value;

        //  Initialize Variables for Calculation & PDF Content
        let membraneSurfaceAreaPerMBR = 0;
        // Perform calculations based on formulas
        if (module == "500D") {
            membraneSurfaceAreaPerMBR = 31.6;
        }

        const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
        const TotalMembraneSurfaceArea = parseFloat(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);

        let boxpipe = 0;
        if (TotalNumberOfModule >= 15) {
            boxpipe = 100;
        } else {
            boxpipe = 80;
        }
        let RequiredtotalAirFlowRate = 0;
        if (module.substring(0, 4) == "500D") {
            RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3)).toFixed(2);
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
        currentY += blockHeight; //41 + blockheight total
        currentY += 10;

        // heading proposal
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Proposal:", 25, currentY);
        doc.setFont("helvetica", "normal");
        doc.text(`Techno Commercial offer for BLUFOX® BF500D 31.6m2 MBR Membranes`, 47, currentY);
        //doc.text(`Proposal: Blufox®  ${flowRate}KLD - MBR Membranes`, 25, currentY);
        currentY += 10; //65 total

        // Image Section
        var img = new Image()
        img.src = 'Images for Proposal/500D 1.jpg';
        doc.addImage(img, 'jpeg', 50, currentY, 100, 100);
        currentY += 120; //190 total

        //features section
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Features', 25, currentY);
        currentY += 5; //195 total
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const features = [
            '• High hydrophilic PVDF membrane',
            '• Reinforced hollow fiber membrane',
            '• Reduced treatment plant footprint',
            '• Long membrane service life',
            '• Consistent and stable flux performance',
            '• Easy to Energysaving due to low operating pressure',
        ];
        features.forEach(feature => {
            currentY += 5;
            doc.text(feature, 30, currentY);
        });


        if (window.updateProgressBar) await window.updateProgressBar(50, "Creating Pages 2-6...");
        // -----------------------------------------------Page 2 ---------------------------------
        // 1. Force a new page
        doc.addPage();

        currentY = headerHeight + 15;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text('Note:', 25, currentY);
        doc.setFont("helvetica", "normal");
        doc.text('Raw Water has been biological treated and gridded with 2mm treatment.', 40, currentY);
        currentY += 5;

        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");

        doc.autoTable({
            startY: currentY,
            head: [['Parameters', 'Unit']],
            body: [
                ['Material of Fiber ', 'Reinforced PVDF with PET Layer Support '],
                ['Element Header ', 'ABS resin (Heavy Duty) '],
                ['Pore size', '0.04 Micron '],
                ['Fiber Size (OD/ID) ', '1.9mm / 0.8mm '],
                ['Surface Area ', '31.6m2'],
                ['Operation Pressure', '-2.95 to -17.71 inHg'],
                ['Backwash Pressure', 'Max 0.15 MPa'],
                ['Operating Temp', '10 - 40 Degree '],
                ['Backwash Time', '30 ~ 120 sec.'],
                ['Turbidity outlet', '<3-1 NTU '],
                ['NaClO tolerance', '5000ppm'],
                ['Element Dimension', '2198 x 844 x 49(mm)']
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



        // UPDATED finalY
        currentY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("Work Method Process ", 25, currentY);
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("MBR system work in base of “Continuous Blower, Intermittent Permeate” with 7/8mins Work and 2mins Stop. Backwash per 3-4hrs with 2mins, CEB per 7day with 90mins ", 25, currentY, { maxWidth: 165, align: "justify" });

        // -----------------------------------------------Page 2 End -------------------------------------------------
        // ---------------------------------Page 3 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;

        //Heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('MBR Size: ZD 500D Series', 25, currentY);
        currentY += 10;

        // Image Section
        var img2 = new Image()
        img2.src = 'Images for Proposal/500D 2.jpg';
        doc.addImage(img2, 'jpeg', 40, currentY, 130, 200);


        //---------------------------------------Page 3 End -------------------------------------------------
        // ---------------------------------Page 4 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;

        //Heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Product Features', 25, currentY);
        currentY += 10; //45 total



        // Bullet Point 1 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Excellent Performance:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText1 = "The Performance of R-PVDF is 10 times better than materials like PES or PS.";
        const textWidth1 = 160;
        const textLines1 = doc.splitTextToSize(longText1, textWidth1);
        const blockHeight1 = textLines1.length * 5;
        doc.text(longText1, 30, currentY, {
            maxWidth: textWidth1,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight1 + 5;




        // Bullet Point 2 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  High Strength:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText2 = "We adopt the independently developed patent process, which is of higher membrane tensile strength and compressive strength. The tensile resistance can reach 200kg+ and the fiber break age ratio is less than 3%. The Inner Potting material use for holding Fibers is PU with combine of epoxy resin, which gives hollow fiber superior strength in aeration mode.";
        const textWidth2 = 160;
        const textLines2 = doc.splitTextToSize(longText2, textWidth2);
        const blockHeight2 = textLines2.length * 5;
        doc.text(longText2, 30, currentY, {
            maxWidth: textWidth2,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight2 + 5;


        // Bullet Point 3 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Permanent Hydrophilic Membrane:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText3 = "Based on patent technology, special hydrophilization processing is applied on RPVDF so as to enable a stronger hydrophilic on membrane filaments and still keep its original superior characteristics. Design of the membranes eliminate the dead pockets which results in reduce the bio fouling of the membranes in long term.";
        const textWidth3 = 160;
        const textLines3 = doc.splitTextToSize(longText3, textWidth3);
        const blockHeight3 = textLines3.length * 5;
        doc.text(longText3, 30, currentY, {
            maxWidth: textWidth3,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight3 + 5;

        // Bullet Point 4 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Internationally Advanced Membrane Micro-structure:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText4 = "The sponge-like structure consists of a surface layer of 0.03 - 0.06 micrometers cerebral cortex, with which membrane processes stronger tolerance to run-through, thus ensuring the safety of water outlet.";
        const textWidth4 = 160;
        const textLines4 = doc.splitTextToSize(longText4, textWidth4);
        const blockHeight4 = textLines4.length * 5;
        doc.text(longText4, 30, currentY, {
            maxWidth: textWidth4,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight4 + 5;


        // Bullet Point 5 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  High Peeling Strength', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText5 = "The membrane won the peeled off even after 1million back-flush.";
        const textWidth5 = 160;
        const textLines5 = doc.splitTextToSize(longText5, textWidth5);
        const blockHeight5 = textLines5.length * 5;
        doc.text(longText5, 30, currentY, {
            maxWidth: textWidth5,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight5 + 5;

        // Bullet Point 6 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Waste Water Optimization', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText6 = "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.";
        const textWidth6 = 160;
        const textLines6 = doc.splitTextToSize(longText6, textWidth6);
        const blockHeight6 = textLines6.length * 5;
        doc.text(longText6, 30, currentY, {
            maxWidth: textWidth6,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight6 + 5;

        // Bullet Point 7 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Waste Water Optimization', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText7 = "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.";
        const textWidth7 = 160;
        const textLines7 = doc.splitTextToSize(longText7, textWidth7);
        const blockHeight7 = textLines7.length * 5;
        doc.text(longText7, 30, currentY, {
            maxWidth: textWidth7,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight7 + 5;

        // Bullet Point 8 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Flexible Operational Control:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText8 = "The efficient interception of membrane intercepts microorganisms completely in the bioreactor, complete separation of HRT and SRT. Flexible operational control.";
        const textWidth8 = 160;
        const textLines8 = doc.splitTextToSize(longText8, textWidth8);
        const blockHeight8 = textLines8.length * 5;
        doc.text(longText8, 30, currentY, {
            maxWidth: textWidth8,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight8 + 5;

        // Bullet Point 9 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Reduce Land and Civil Construction Investment:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText9 = "The concentration of MBR tank’s activate sludge is around 8,000 – 12,000 mg/l, which both spares the room for sedimentation tank and minimizes land occupation and construction investment. The occupied area is about 1/3 of the traditional process.";
        const textWidth9 = 160;
        const textLines9 = doc.splitTextToSize(longText9, textWidth9);
        const blockHeight9 = textLines9.length * 5;
        doc.text(longText9, 30, currentY, {
            maxWidth: textWidth9,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight9 + 5;

        // ---------------------------------------Page 4 End -------------------------------------------------
        // ---------------------------------Page 5 Start ---------------------------------

        // 1. Force a new page
        doc.addPage();

        currentY = headerHeight + 15;

        // Bullet Point 10 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Reproduction of Nitro bacteria:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText10 = "High systematic nitrification efficiency is beneficial to the retention and reproduction of nitrobacteria. Deamination and de-phosphorization may also be realized if the mode of operation is changed.";
        const textWidth10 = 160;
        const textLines10 = doc.splitTextToSize(longText10, textWidth10);
        const blockHeight10 = textLines10.length * 5;
        doc.text(longText10, 30, currentY, {
            maxWidth: textWidth10,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight10 + 5;

        // Bullet Point 11 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Improve the Degradation Efficiency:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText11 = "The degradation efficiency of refractory organics can be enhanced greatly since the sludge age can be very long.";
        const textWidth11 = 160;
        const textLines11 = doc.splitTextToSize(longText11, textWidth11);
        const blockHeight11 = textLines11.length * 5;
        doc.text(longText11, 30, currentY, {
            maxWidth: textWidth11,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight11 + 5;

        // Bullet Point 12 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Can achieve Zero Sludge Discharge:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText12 = "Operated under high volumetric loading, low sludge loading, long sludge age, the reactor yields extremely low residual sludge. Due to the infinite sludge age, theoretically zero-release of sludge can be achieved.";
        const textWidth12 = 160;
        const textLines12 = doc.splitTextToSize(longText12, textWidth12);
        const blockHeight12 = textLines12.length * 5;
        doc.text(longText12, 30, currentY, {
            maxWidth: textWidth12,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight12 + 5;


        // Bullet Point 13 start----------------------------------
        // heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text('\u2022  Easy Operation and Management:', 30, currentY);

        // description
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longText13 = "PLC control of system brings a convenient operation and management process. Simple rack or frame design ensure ease of design as well as maintenance.";
        const textWidth13 = 160;
        const textLines13 = doc.splitTextToSize(longText13, textWidth13);
        const blockHeight13 = textLines13.length * 5;
        doc.text(longText13, 30, currentY, {
            maxWidth: textWidth13,
            align: "justify"
        });
        //  Move cursor down based on how many lines were drawn
        currentY += blockHeight13 + 10;


        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('MBR Working Cycle Programming:', 25, currentY);
        currentY += 5; //45 total
        //Image
        var img3 = new Image()
        img3.src = 'Images for Proposal/MBR working cycle programming.jpg'
        doc.addImage(img3, 'jpeg', 25, currentY, 160, 30);

        currentY += 45;
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

        // ---------------------------------------Page 5 End -------------------------------------------------
        //-----------------------------------------Page 6 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;

        //Image
        var img4 = new Image()
        img4.src = 'Images for Proposal/500D 3.jpg'
        doc.addImage(img4, 'jpeg', 55, currentY, 100, 100)
        currentY += 115;


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
                ['1.', `Blufox - MBR Membranes
Surface Area: 31.6m2
MOC: R-PVDF`, `${TotalNumberOfModule}`, `${(offer_Price * TotalNumberOfModule).toLocaleString('en-IN')}/-`],
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

        currentY += 10;


        // --- PAYMENT TERMS HEADING ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Terms & Conditions:', 25, currentY);
        currentY += 7;

        // --- TERMS BULLET POINTS ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const termsConditions = [
            "1. GST 18% extra.",
            "2. Freight will be charges extra.",
            "3. Installation under client scope.",
            "4. Prices Validity 30 days (USD fluctuation).",
            "5. Delivery of Goods discussion at the time of order.",
            "6. Standard warranty one year from the date of supply against manufacturing defect."
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

        // --- PAYMENT TERMS HEADING ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Payment Terms & Conditions:', 25, currentY);
        currentY += 7;

        // --- TERMS BULLET POINTS ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("100% advance along with purchase order along with GST. ", 25, currentY);

        if (window.updateProgressBar) await window.updateProgressBar(90, "Finalizing Document...");


        // ---------------------------------------Page 6 End -------------------------------------------------
        //----------------------------------------Page 7 Start -----------------------------------------------

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

        //Heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Warehouse Charges: ', 25, currentY);
        currentY += 7;
        //Content 2 bullet points justified
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const warehouseText = [
            "1. Charges will be 0.5% on Plant Value, if not picked up as per the dispatch schedule agreed at the time of order finalization. ",
            "2. If applicable, need to be clear separately before the dispatch of material"
        ];
        warehouseText.forEach(text => {
            let lines = doc.splitTextToSize(text, 165);
            let blockHeight = lines.length * 5;
            doc.text(lines, 30, currentY);
            currentY += blockHeight + 2;
        });
        currentY += 5;

        //Heading
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Freight & Transportation: ', 25, currentY);
        currentY += 7;
        //Content 2 bullet points justified
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const freightText = [
            "• Loading / Unloading charges must be paid by Client to the transporter directly, with duly signed copy of authorized signatory on ‘packing list’. ",
            "• Checking & verifying all the materials, as mentioned in packing list is a due responsibility of client. Any misplacement or damaged equipment afterwards will not be acceptable. ",
            "• Any damage during the unloading of materials or shifting of equipment’s to the particular place will not be entertained & the whole and soul responsibility will be of client. ",
            "• Any unskilled labour and/or any unloading equipment required during the unloading/ shifting of materials at site will be the responsibility of concerned party/person present at site only."
        ];
        freightText.forEach(text => {
            let lines = doc.splitTextToSize(text, 165);
            let blockHeight = lines.length * 5;
            doc.text(lines, 30, currentY);
            currentY += blockHeight + 2;
        });
        currentY += 5;

        //Delivery
        doc.setFontSize(11);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Delivery: ', 25, currentY);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("4-8 weeks from date of Purchase order with advance payment Subject to Surat Jurisdiction only", 42, currentY, { maxWidth: 145, align: "justify" });
        currentY += 20;


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



        //----------------------------------------Page 7 End -----------------------------------------------



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
 * Logic for generating 500D Series Word Proposals
 */
async function generate500DWordProposal(btn) {
    btn.textContent = 'Generating Word Doc...';
    btn.disabled = true;

    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing 500D Proposal Word Document...");

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
        if (module == "500D") {
            membraneSurfaceAreaPerMBR = 31.6;
        }

        const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
        const TotalMembraneSurfaceArea = parseFloat(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);

        let RequiredtotalAirFlowRate = 0;
        if (module.substring(0, 4) == "500D") {
            RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3)).toFixed(2);
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
        const image1 = await loadImage('Images for Proposal/500D 1.jpg');
        const image2 = await loadImage('Images for Proposal/500D 2.jpg');
        const image3 = await loadImage('Images for Proposal/500D 3.jpg');
        const cycleImgDataUrl = await loadImage('Images for Proposal/MBR working cycle programming.jpg');

        const headerBuffer = base64ToUint8Array(headerDataUrl);
        const footerBuffer = base64ToUint8Array(footerDataUrl);
        const image1Buffer = base64ToUint8Array(image1);
        const image2Buffer = base64ToUint8Array(image2);
        const image3Buffer = base64ToUint8Array(image3);
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
                    new TextRun({ text: `Techno Commercial offer for BLUFOX® BF500D 31.6m2 MBR Membranes`, size: 24 })
                ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new ImageRun({ data: image1Buffer, transformation: { width: 380, height: 380 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new TextRun({ text: "Features", bold: true, italics: true, color: "00008B", size: 28 })]
            }),
            new Paragraph({ text: "" }),
            // Use indent property for bullet point indentation in Word output
            new Paragraph({ text: "• High hydrophilic PVDF membrane", indent: { left: 350 } }),
            new Paragraph({ text: "• Reinforced hollow fiber membrane", indent: { left: 350 } }),
            new Paragraph({ text: "• Reduced treatment plant footprint", indent: { left: 350 } }),
            new Paragraph({ text: "• Long membrane service life", indent: { left: 350 } }),
            new Paragraph({ text: "• Consistent and stable flux performance", indent: { left: 350 } }),
            new Paragraph({ text: "• Easy to Energysaving due to low operating pressure", indent: { left: 350 } }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 1
        ];

        // --- Page 2 Content ---
        const page2Children = [
            ...spacer,

           new Paragraph({
  children: [
    new TextRun({text: "Note: ", bold: true}),
    new TextRun({ text: "Raw water has been biologically treated and screened with 2 mm treatment." })
  ]}),
new Paragraph({ text: "" }),
            createTable(['Parameters', 'Unit'], [
                ['Material of Fiber ', 'Reinforced PVDF with PET Layer Support '],
                ['Element Header ', 'ABS resin (Heavy Duty) '],
                ['Pore size', '0.04 Micron '],
                ['Fiber Size (OD/ID) ', '1.9mm / 0.8mm '],
                ['Surface Area ', '31.6m2'],
                ['Operation Pressure', '-2.95 to -17.71 inHg'],
                ['Backwash Pressure', 'Max 0.15 MPa'],
                ['Operating Temp', '10 - 40 Degree '],
                ['Backwash Time', '30 ~ 120 sec.'],
                ['Turbidity outlet', '<3-1 NTU '],
                ['NaClO tolerance', '5000ppm'],
                ['Element Dimension', '2198 x 844 x 49(mm)']
            ]),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Work Method Process", bold: true })] }),
            new Paragraph({ text: "MBR system work in base of “Continuous Blower, Intermittent Permeate” with 7/8mins Work and 2mins Stop. Backwash per 3-4hrs with 2mins, CEB per 7day with 90mins" }),
            new Paragraph({ children: [new PageBreak()] })
        ];

        //end page2
        //---------Page 3 Content------------

        const page3Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "MBR Size: ZD 500D Series", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),

            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new ImageRun({ data: image2Buffer, transformation: { width: 530, height: 750 } })],
                alignment: AlignmentType.CENTER
            }),

            new Paragraph({ children: [new PageBreak()] })
        ];

        //End Page 3
        //--- Page 4 Content ---
        const page4Children = [
            ...spacer,

            new Paragraph({ children: [new TextRun({ text: "Product Features", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),


            new Paragraph({ children: [new TextRun({ text: "• Excellent Performance:", bold: true, size: 24 })], indent: { left: 350 } }),
            //set new paragraph font size to 6 according to word size
            new Paragraph({ text: "The Performance of R-PVDF is 10 times better than materials like PES or PS.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• High Strength:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "We adopt the independently developed patent process, which is of higher membrane tensile strength and compressive strength. The tensile resistance can reach 200kg+ and the fiber break age ratio is less than 3%. The Inner Potting material use for holding Fibers is PU with combine of epoxy resin, which gives hollow fiber superior strength in aeration mode.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Permanent Hydrophilic Membrane:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Based on patent technology, special hydrophilization processing is applied on RPVDF so as to enable a stronger hydrophilic on membrane filaments and still keep its original superior characteristics. Design of the membranes eliminate the dead pockets which results in reduce the bio fouling of the membranes in long term.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Internationally Advanced Membrane Micro-structure:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The sponge-like structure consists of a surface layer of 0.03 - 0.06 micrometers cerebral cortex, with which membrane processes stronger tolerance to run-through, thus ensuring the safety of water outlet.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• High Peeling Strength:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The membrane won the peeled off even after 1million back-flush.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Waste Water Optimization:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Flexible Operational Control:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The efficient interception of membrane intercepts microorganisms completely in the bioreactor, complete separation of HRT and SRT. Flexible operational control.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Reduce Land and Civil Construction Investment:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The concentration of MBR tank’s activate sludge is around 8,000 – 12,000 mg/l, which both spares the room for sedimentation tank and minimizes land occupation and construction investment. The occupied area is about 1/3 of the traditional process.", indent: { left: 350 } }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 4
        ];

        // --- Page 5 Content ---
        const page5Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "• Reproduction of Nitro bacteria:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "High systematic nitrification efficiency is beneficial to the retention and reproduction of nitrobacteria. Deamination and de-phosphorization may also be realized if the mode of operation is changed.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Improve the Degradation Efficiency:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The degradation efficiency of refractory organics can be enhanced greatly since the sludge age can be very long.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Can achieve Zero Sludge Discharge:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Operated under high volumetric loading, low sludge loading, long sludge age, the reactor yields extremely low residual sludge. Due to the infinite sludge age, theoretically zero-release of sludge can be achieved.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Easy Operation and Management:", bold: true, size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "PLC control of system brings a convenient operation and management process. Simple rack or frame design ensure ease of design as well as maintenance.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
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
            new Paragraph({ children: [new PageBreak()] }) // End Page 5
        ];


        // --- Page 6 Content ---
        const page6Children = [
            ...spacer,

            new Paragraph({
                children: [new ImageRun({ data: image3Buffer, transformation: { width: 380, height: 380 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),

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
                                        new TextRun({ text: "Blufox - MBR Membranes" }),
                                        // break: 1 creates a new line within the same cell
                                        new TextRun({ text: `Plant Capacity: ${flowRate} KLD ${treatment_Type}`, break: 1 }),
                                        new TextRun({ text: "with SS304 Skid(Frame)", break: 1 }),
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
            new Paragraph({ children: [new TextRun({ text: "Terms & Conditions:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "1. GST 18% extra.", indent: { left: 350 } }),
            new Paragraph({ text: "2. Freight will be charges extra.", indent: { left: 350 } }),
            new Paragraph({ text: "3. Installation under client scope.", indent: { left: 350 } }),
            new Paragraph({ text: "4. Prices Validity 30 days (USD fluctuation).", indent: { left: 350 } }),
            new Paragraph({ text: "5. Delivery of Goods discussion at the time of order.", indent: { left: 350 } }),
            new Paragraph({ text: "6. Standard warranty one year from the date of supply against manufacturing defect.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),


            //Payment Terms & Conditions
            new Paragraph({ text: "" }),
            // line height exactly 400 TWIPs (~14pt) for spacing
            new Paragraph({ children: [new TextRun({ text: "Payment Terms & Conditions:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "100% advance along with purchase order along with GST." }),

            new Paragraph({ children: [new PageBreak()] }) // End Page 6
        ];

        // --- Page 7 Content ---

        const page7Children = [
            ...spacer,
            //Warehouse charges
            new Paragraph({ children: [new TextRun({ text: "Warehouse Charges:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "1. Charges will be 0.5% on Plant Value, if not picked up as per the dispatch schedule agreed at the time of order finalization.", indent: { left: 350 } }),
            new Paragraph({ text: "2. If applicable, need to be clear separately before the dispatch of material", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            //Freight & Transportation
            new Paragraph({ children: [new TextRun({ text: "Freight & Transportation:", bold: true, italics: true, color: "00008B" })], spacing: { line: 380 } }),
            new Paragraph({ text: "• Loading / Unloading charges must be paid by Client to the transporter directly, with duly signedcopy of authorized signatory on ‘packing list’.", indent: { left: 350 } }),
            new Paragraph({ text: "• Checking & verifying all the materials, as mentioned in packing list is a due responsibility of client. Any misplacement or damaged equipment afterwards will not be acceptable.", indent: { left: 350 } }),
            new Paragraph({ text: "• Any damage during the unloading of materials or shifting of equipment’s to the particular place will not be entertained & the whole and soul responsibility will be of client.", indent: { left: 350 } }),
            new Paragraph({ text: "• Any unskilled labour and/or any unloading equipment required during the unloading/ shifting of materials at site will be the responsibility of concerned party/person present at site only.", indent: { left: 350 } }),
new Paragraph({ text: "" }),
            //Delivery Time
            new Paragraph({
                children: [
                    new TextRun({ text: "Delivery: ", bold: true, italics: true, color: "00008B"}),
                    new TextRun({ text: "4–8 weeks from the date of Purchase Order with advance payment. Subject to Surat jurisdiction only.", bold: false, italics: false,color: "000000"
                    })
                ],
                spacing: { line: 380 }
            }),
        ];

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
                            size: 22, // 11pt = 22 half-points
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
window.generate500DProposal = generate500DProposal;
window.generate500DWordProposal = generate500DWordProposal;