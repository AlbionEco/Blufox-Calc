
// Import libraries directly (Modern ESM)
import * as docx from "https://esm.sh/docx@8.5.0";
import saveAs from "https://esm.sh/file-saver@2.0.5"; // Fixed: Default import

/**
 * Logic for generating BF Series Proposals
 */
async function generateBFProposal(btn) {
    btn.textContent = 'Generating...';
    btn.disabled = true;
    
    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing BF Proposal PDF...");

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
        if (module == "BF100N" || module == "BF100oxy" || module == "BF100") {
            membraneSurfaceAreaPerMBR = 10;
        } else if (module == "BF150N") {
            membraneSurfaceAreaPerMBR = 15;
        } else if (module == "BF200N" || module == "BF200oxy" || module == "BF200") {
            membraneSurfaceAreaPerMBR = 20;
        } else if (module == "BF125") {
            membraneSurfaceAreaPerMBR = 12.5;
        } else if (module == "BF300") {
            membraneSurfaceAreaPerMBR = 30;
        } else if (module == "BF220oxy") {
            membraneSurfaceAreaPerMBR = 22;
        }

        const effectiveFlowRate = flowRate / 20 //hr;
        const perTrainFlowRate = parseFloat(effectiveFlowRate / noOfTrain).toFixed(2);
        const RasPumpFlow = parseFloat((flowRate / 24) * 3).toFixed(2);
        const TotalNumberOfModule = Math.ceil((flowRate * 1000) / (flux * workingHr * membraneSurfaceAreaPerMBR));
        const NoofModulePerTrain = Math.ceil(TotalNumberOfModule / noOfTrain);
        const MembraneSurfaceAreaPerTrain = NoofModulePerTrain * membraneSurfaceAreaPerMBR
        const TotalMembraneSurfaceArea = parseFloat(TotalNumberOfModule * membraneSurfaceAreaPerMBR).toFixed(1);
        const OperatingFlux = parseFloat(flux * 0.0238).toFixed(1);
        const rawTimeFlux = parseFloat(flux * 83.34 / 100).toFixed(1);
        const Timeflux = parseFloat(rawTimeFlux * 0.0238).toFixed(1);

        let length = 0;
        let width = 0;
        let height = 0;
        let effectiveWaterDepth = 0;
        let width2 = 0;
        let surfaceareapertrain = 0;
        let boxpipe = 0;
        if (TotalNumberOfModule >= 15) {
            boxpipe = 100;
        } else {
            boxpipe = 80;
        }

        if (module == "BF100") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1300 / 1000;
            effectiveWaterDepth = 1.6;
            width2 = 2.3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF100N" || module == "BF125" || module == "BF100oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1300 / 1000;
            effectiveWaterDepth = 1.6;
            width2 = 2.3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF150N" || module == "BF200" || module == "BF200oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1800 / 1000;
            effectiveWaterDepth = 2.1;
            width2 = 3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF200N" || module == "BF300") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 2300 / 1000;
            effectiveWaterDepth = 2.7;
            width2 = 4;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF220oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 2355 / 1000;
            effectiveWaterDepth = 2.77;
            width2 = 4;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        }
        const TotalMembraneTankVolume = parseFloat(surfaceareapertrain).toFixed(2);
        const lengthinsidepertank = parseFloat(TotalMembraneTankVolume / effectiveWaterDepth / width2).toFixed(1);
        const RequiredTotalFlowrateforpeakflux = parseFloat(flowRate / workingHr).toFixed(2);
        const filteration = 8;

        const backwash = 1;
        const RequiredBackwashFlowRate = parseFloat(RequiredTotalFlowrateforpeakflux * 1.5).toFixed(2);
        let RequiredtotalAirFlowRate = 0;
        if (module.substring(0, 2) == "BF") {
            RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3)).toFixed(2);
        }
        const RequiredtotalAirFlowRatepereach = parseFloat((RequiredtotalAirFlowRate / noOfTrain)).toFixed(1);
        const requiredAirBlowerDischargePressure = parseFloat(effectiveWaterDepth * 1.675).toFixed(1);
        const BackwashNacloConcentration = 20;
        const backwashRequiredChemicalSolutionVolume = 100;
        const backwashRequiredChemicalQuantity = parseFloat(((((RequiredBackwashFlowRate * 1000 / 60) * 24) * 20 / 1000000) / 0.1)).toFixed(2);
        const CebNacloConcentration = 500;
        const CebRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
        const CebRequiredChemicalQuantityeachTime = parseFloat((CebRequiredChemicalSolutionVolume * Number(CebNacloConcentration) / 1000000) / 0.1).toFixed(1);
        const CebChemicalSolutionInjectionTime = 20;
        const CebChemicalInjectionFlowrate = parseFloat(CebRequiredChemicalSolutionVolume / CebChemicalSolutionInjectionTime).toFixed(1);
        const CipNacloConcentration = 3000;
        const CipRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
        const CipRequiredChemicalQuantityeachTime = parseFloat((CipRequiredChemicalSolutionVolume * Number(CipNacloConcentration) / 1000000) / 0.1).toFixed(1);
        const CipChemicalSolutionInjectionTime = 20;
        const CipChemicalInjectionFlowrate = parseFloat(CipRequiredChemicalSolutionVolume / CipChemicalSolutionInjectionTime).toFixed(1);
        const acidConcentration = 10000;
        const acidRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
        const acidRequiredChemicalQuantityeachTime = parseFloat((acidRequiredChemicalSolutionVolume * Number(acidConcentration) / 1000000) / 0.3).toFixed(1);
        const acidChemicalSolutionInjectionTime = 20;
        const acidChemicalInjectionFlowrate = parseFloat(acidRequiredChemicalSolutionVolume / acidChemicalSolutionInjectionTime).toFixed(1);
        const CebAcidConcentration = 300;
        const CebacidRequiredChemicalSolutionVolume = TotalMembraneSurfaceArea * 2;
        const CebacidRequiredChemicalQuantityeachTime = parseFloat((CebacidRequiredChemicalSolutionVolume * Number(CebAcidConcentration) / 1000000) / 0.3).toFixed(1);
        const CebAcidChemicalSolutionInjectionTime = 20;
        const CebAcidChemicalInjectionFlowrate = parseFloat(CebacidRequiredChemicalSolutionVolume / CebAcidChemicalSolutionInjectionTime).toFixed(1);



        let ModuleSize = "";

        if (module == "BF100" || module == "BF100N" || module == "BF125" || module == "BF100oxy") {
            ModuleSize = "1000 x 534 x 46"
        } else if (module == "BF150N" || module == "BF200" || module == "BF200oxy") {
            ModuleSize = "1500 x 534 x 46"
        } else if (module == "BF200N" || module == "BF300") {
            ModuleSize = "2000 x 534 x 46"
        } else if (module == "BF220oxy") {
            ModuleSize = "2055 x 534 x 46"
        }


        //  Load Images (Async)
        if (window.updateProgressBar) await window.updateProgressBar(15, "Loading Images...");
        const headerImgData = await loadImage('Images for Proposal/header.png');
        const footerImgData = await loadImage('Images for Proposal/footer.png');


        // 6. Generate PDF
        if (window.updateProgressBar) await window.updateProgressBar(30, "Initializing Document...");
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

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
        let currentY = headerHeight + 25;

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
        doc.text(`Blufox®  ${flowRate}KLD ${treatment_Type}- MBR Membranes`, 47, currentY);
        //doc.text(`Proposal: Blufox®  ${flowRate}KLD - MBR Membranes`, 25, currentY);
        currentY += 10; //65 total

        // Image Section
        var img = new Image()
        img.src = 'Images for Proposal/MembraneImage1.png'
        doc.addImage(img, 'png', 40, currentY, 140, 100);
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

        currentY = headerHeight + 25;
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

        // ---------------------------------------Page 2 End -------------------------------------------------
        // ---------------------------------Page 3 Start ---------------------------------

        // 1. Force a new page
        doc.addPage();

        currentY = headerHeight + 25;

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
        currentY += blockHeight13 + 5;



        //Heading
        currentY += 20;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Process Description of MBR Membranes: ', 25, currentY);
        currentY += 10;

        // description 1
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longTextProcessDescription1 = "MBR tank receives Effluent with the required MLSS after the aeration process. MBR tank consists of MBR membrane modules mounted on structural frame Air diffuser are provided. Below the membrane modules for air scouring";
        const textWidthProcessDescription1 = 160;
        const textLinesProcessDescription1 = doc.splitTextToSize(longTextProcessDescription1, textWidthProcessDescription1);
        const blockHeightProcessDescription1 = textLinesProcessDescription1.length * 5;
        doc.text(longTextProcessDescription1, 25, currentY, {
            maxWidth: textWidthProcessDescription1,
            align: "justify"
        });
        currentY += blockHeightProcessDescription1 + 5

        //description 2
        currentY += 5;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const longTextProcessDescription2 = "The filtration takes place by means of suction pump which delivers the treated water in the product water tank, a part of the treated water is collected in a overhead backwash water tank. After every 7-8 minutes of service cycle the membranes are subjected to relaxation of 60 seconds. Backwash takes place typically after every 8 Cycle for a period of 1 minutes. In this step, product water from the overhead backwash tank flows by Pump into the membrane module and dislodges the impurities from the membrane surface. Air scouring continues during filtration, rest and backwash period."
        const textWidthProcessDescription2 = 160;
        const textLinesProcessDescription2 = doc.splitTextToSize(longTextProcessDescription2, textWidthProcessDescription2);
        doc.text(longTextProcessDescription2, 25, currentY, {
            maxWidth: textWidthProcessDescription2,
            align: "justify"
        });



        // ---------------------------------------Page 3 End -------------------------------------------------
        //-----------------------------------------Page 4 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Standard Operating Conditions:', 25, currentY);
        currentY += 5;

        //Table
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");

        doc.autoTable({
            startY: currentY,
            head: [['Parameters', 'Unit', 'Range']],
            body: [
                ['Required MLSS', 'mg/lit', '6000-12000'],
                ['Permeate Water Flux', 'LMH', '10-30'],
                ['Air flow Required/Scouring', 'm2/m3/hr', '0.20-0.35'],
                ['Max. Trans Pressure (TMP)', 'mm/Hg (inHg.)', '500(-20)'],
                ['Back Wash Pressure', 'Kg/cm2', '1-1.5'],
                ['DO in MBR Basin', 'mg/l', '1-3'],
                ['MLVSS Ratio', '-', '80%'],
                ['Membrane PH tolerance', '-', '3-10'],
                ['Temperature', 'Degree', '10-40'],
                ['NaClo Tolerance', 'mg/lit (ppm)', '5000'],
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
        currentY = doc.lastAutoTable.finalY + 5;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        doc.text("** Kindly remove Fat, Oil, Grease to protect membranes from fouling and choking, use 1-2mm size fine screen in aeration tank feed line to reduce the heavy TSS stuck to the membranes surface during suction.", 25, currentY, { maxWidth: 165, align: "justify" });

        //auto table

        currentY += 25;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(200, 0, 0);
        doc.text(`${module}`, 25, currentY);
        let currentX = 25 + doc.getTextWidth(`${module}`);
        doc.setTextColor(0, 0, 139);
        doc.text(` - Membrane Specification`, currentX, currentY);
        //doc.text(`${module} - Membrane Specification`, 25, currentY);



        //Table
        currentY += 5;
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.setFont("helvetica", "normal");
        doc.autoTable({
            startY: currentY,
            head: [['Items', 'Unit']],
            body: [
                ['Material of Fiber', 'Reinforced PVDF with PET Layer Support'],
                ['Element Header', 'ABS resin (Heavy Duty)'],
                ['Pore size', '0.03-0.06 Micron (outside - in) '],
                ['Fiber Size (OD/ID)', '2.0mm / 0.9mm'],
                ['Surface Area (MBR)', `${membraneSurfaceAreaPerMBR} m2/module`],
                ['Operation Pressure', '2.95 to17.71 inHg (minus)'],
                ['Backwash Pressure ', 'Max 0.2 MPa'],
                ['Backwash Time ', '30~120 sec.'],
                ['Turbidity outlet', '<1 NTU'],
                ['Element Dimension', `${ModuleSize} mm (Drawing as below)`],
            ],

            // TABLE WIDTH FIXED = 165mm
            tableWidth: 165,
            margin: { left: 25 },
            theme: 'grid',

            // HEADER STYLE – BOLD
            headStyles: { fillColor: [169, 169, 169], fontStyle: 'bolditalic', halign: 'left' },

            // BODY STYLE – NORMAL + LEFT ALIGN
            styles: { fontStyle: 'normal', halign: 'left', textColor: 0 },

            // ALTERNATE ROW COLORS   // light gray
            alternateRowStyles: { fillColor: [240, 240, 240] },
            // White row
            bodyStyles: { fillColor: [255, 255, 255] },
        });
        currentY = doc.lastAutoTable.finalY + 5;




        // ---------------------------------------Page 4 End -------------------------------------------------
        //-----------------------------------------Page 5 Start ---------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Typical P&ID', 25, currentY);
        currentY += 5; //45 total
        // Image Section
        var img2 = new Image()
        //img2.src = 'MembraneP&ID.png'
        img2.src = 'Images for Proposal/MembraneP&ID.jpg'
        doc.addImage(img2, 'png', 20, currentY, 180, 215);
        // ---------------------------------------Page 5 End -------------------------------------------------
        // ---------------------------------------Page 6 Start -------------------------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;
        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('MBR Membranes GA Drawing', 25, currentY);
        currentY += 5; //45 total
        // Image Section
        var img3 = new Image()
        img3.src = 'Images for Proposal/MembraneGADrawing.png'
        doc.addImage(img3, 'png', 25, currentY, 180, 200);
        // ---------------------------------------Page 6 End -------------------------------------------------
        //----------------------------------------Page 7 Start -----------------------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;
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
                ['Total MBR Module Required(BLUFOX®)', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', `${(length * 1000)} x ${((width) * 1000)} x ${(height * 1000)}`],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', `${TotalMembraneTankVolume}`],
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
        doc.text("1. Vertical Distance between the water level in the MBR tank and back wash tank shall not be more than 0.7mtr", 30, currentY + 5, { maxWidth: 165, align: "justify" });
        doc.text("2. Maintain the water level 300-500mm above the MBR frame / Module.", 30, currentY + 15, { maxWidth: 165, align: "justify" });

        // ---------------------------------------Page 7 End -------------------------------------------------
        //----------------------------------------Page 8 Start -----------------------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 15;

        // -------------------- MAIN HEADING --------------------
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("MBR Feed Limiting Conditions", 105, currentY, { align: "center" });

        currentY += 6;

        // -------------------- SUB TEXT --------------------
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(
            "Customer must ensure the feeding limits for MBR tank shall be as per the below table. In case the MBR feed limits are not meeting as per the below section, it may lead to Membrane damage / failure for which Supplier shall not be responsible.",
            15,
            currentY,
            { maxWidth: 180, align: "justify" }
        );

        currentY += 15;

        // -------------------- TABLE DATA --------------------

        const tableHead = [
            ["#", "Parameter", "Design Value", "Accepted Operating Range", "Units"]
        ];

        const tableBody = [
            [1, "Membrane tank MLSS concentration", "10000", "8,000-12,000", "mg/L"],
            [2, "Bioreactor MLSS", "8000", "6,000-10,000", "mg/L"],
            [3, "Bioreactor MLVSS concentration", "75", ">70%", "MLSS"],
            [4, "Dissolved oxygen concentration", "2", "1.5-3.0", "mg/L"],
            [5, "pH of mixed liquor in membrane tanks", "7", "6.5-8.0", "-"],
            [6, "Total SRT in Bioreactor", "NA", "15-20", "days"],
            [7, "Soluble cBOD5 in mixed liquor entering membrane tanks", "<5", "≤10", "mg/L"],
            [8, "NH3-N in mixed liquor entering membrane tanks", "0.5", "≤1", "mg/L"],
            [9, "Soluble COD", "<50", "<50", "mg/L"],
            [10, "Total Hardness (as CaCO3)", "-", "Not Scaling", "-"],
            [11, "Soluble Alkalinity (as CaCO3)", "100", "50-150", "mg/L"],
            [12, "Colloidal TOC (cTOC) concentration (Note 1)", "7", "≤10", "mg/L"],
            [13, "Total time to filter (TTF) (Note 2)", "100", "200", "s"],
            [14, "Mixed liquor recirculation from MBR -> Bioreactor (Note 3)", "4", "4 ± 10%", "4Q"],
            [15, "Trash/Solids >2mm", "0", "≤2", "mg/L"],
            [16, "Fats, Oil & Grease (FOG)", "<10 mg/L emulsified oil", "<10 mg/L mineral/non-biodegradable oil", "mg/L"],
            [17, "Mixed Liquor Temperature", "25", "25-35", "°C"]
        ];

        doc.autoTable({
            startY: currentY,
            head: tableHead,
            body: tableBody,
            theme: "grid",
            tableWidth: 180,
            margin: { left: 15 },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center"
            },
            styles: {
                fontSize: 11,
                cellPadding: 2,
                valign: "middle",
                halign: "left"
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245] // light gray
            }
        });

        currentY = doc.lastAutoTable.finalY + 8;

        if (window.updateProgressBar) await window.updateProgressBar(75, "Adding Notes & Commercials...");

        // ---------------------------------------Page 8 End -------------------------------------------------
        //----------------------------------------Page 9 Start -----------------------------------------------

        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;

        // -------------------- NOTES SECTION --------------------

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("NOTES:", 25, currentY);

        currentY += 7;

        const notes = [
            " Colloidal TOC (cTOC) is the difference between the TOC measured in the filtrate passing through a 1.5 µm filter paper and the TOC measured in the Blufox permeate. TOC measurement shall follow standard water testing methods.",
            " Per Seller's Time To Filter (TTF) procedure (available upon request).",
            " Assuming a MLSS recirculation ratio of 3Q (Pump configuration). Customer to confirm.",
            " Chemicals incompatible with BLUFOX PVDF membranes must not enter MBR tank (compatibility list available).",
            " Biological & membrane process designed for 25-35°C. Avoid >38°C.",
            " TDS of treated water <3000 ppm. Chlorides <1500 ppm. Sulphates <700 ppm.",
            " Oil & Grease must not exceed 10 mg/L (emulsified) with no free oil.",
            " Adequate alkalinity must be maintained for biological performance; chemical dosing may be required."
        ];

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        notes.forEach((note, i) => {
            const numberedText = `${i + 1}. ${note}`;
            const lines = doc.splitTextToSize(numberedText, 160);
            doc.text(lines, 25, currentY, { maxWidth: 160, align: "justify" });
            currentY += lines.length * 6;
        });

        currentY += 15;

        //heading
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('MBR Working Cycle Programming:', 25, currentY);
        currentY += 5; //45 total
        //Image
        var img4 = new Image()
        img4.src = 'Images for Proposal/MBR working cycle programming.png'
        doc.addImage(img4, 'png', 25, currentY, 160, 30);


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

        // ---------------------------------------Page 9 End -------------------------------------------------
        //----------------------------------------Page 10 Start -----------------------------------------------
        // 1. Force a new page
        doc.addPage();
        currentY = headerHeight + 20;


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

        currentY += 10;
        //Heading
        doc.setFontSize(14);
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
        doc.setFontSize(14);
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
        currentY += 20;


        // --- PAYMENT TERMS HEADING ---
        doc.setFontSize(14);
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(0, 0, 139);
        doc.text('Payment Terms and Conditions:', 25, currentY);
        currentY += 7;

        // --- TERMS BULLET POINTS ---
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const termsConditions = [
            "1)  Above Prices ex. work only.",
            "2)  GST 18 % will be extra.",
            "3)  Freight & Packing will be charges extra as actual.",
            "4)  Payment 50% Advance and 50% before delivery.",
            "5)  Offer Validity 30 days from offer date.",
            "6)  Installation under client scope only.",
            "7)  Delivery 15-60 days of Purchase Order along with advance payment.",
            "8)  Membrane Warranty will be one year against manufacturing defect only.",
            "9)  Client has to submit the feed water data, Process flow diagram, P&ID, Programming cycle design before commissioning of the plant, if client wants to understand the CEB / CIP process, supplier can provide video training support to client.",
            "10) Any other terms and conditions will be as per Blufox standard terms and conditions."
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

        // ---------------------------------------Page 10 End -------------------------------------------------
        //----------------------------------------Page 11 Start -----------------------------------------------


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


        // --- IMAGES SECTION ---
        // Images height is 50, plus some padding.
        const imagesHeight = 55;

        checkPageBreak(imagesHeight);

        try {
            // Image 1
            var img5 = new Image();
            img5.src = 'Images for Proposal/Blufox Extra Image 1.png';
            doc.addImage(img5, 'png', 20, currentY, 50, 50);

            // Image 2
            var img6 = new Image();
            img6.src = 'Images for Proposal/Blufox Extra Image 2.png';
            doc.addImage(img6, 'png', 80, currentY, 50, 50);

            // Image 3
            var img7 = new Image();
            img7.src = 'Images for Proposal/Blufox Extra Image 3.png';
            doc.addImage(img7, 'png', 145, currentY, 50, 50);

            // Advance Y after images
            currentY += 55;
        } catch (e) {
            console.error("Error adding images: ", e);
        }

        //----------------------------------------Page 11 End -----------------------------------------------







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
 * Logic for generating BF Series Word Proposals
 */
async function generateBFWordProposal(btn) {
    btn.textContent = 'Generating Word Doc...';
    btn.disabled = true;

    // Show progress bar
    if (window.showProgressBar) window.showProgressBar("Initializing BF Proposal Word Document...");

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
        if (module == "BF100N" || module == "BF100oxy" || module == "BF100") {
            membraneSurfaceAreaPerMBR = 10;
        } else if (module == "BF150N") {
            membraneSurfaceAreaPerMBR = 15;
        } else if (module == "BF200N" || module == "BF200oxy" || module == "BF200") {
            membraneSurfaceAreaPerMBR = 20;
        } else if (module == "BF125") {
            membraneSurfaceAreaPerMBR = 12.5;
        } else if (module == "BF300") {
            membraneSurfaceAreaPerMBR = 30;
        } else if (module == "BF220oxy") {
            membraneSurfaceAreaPerMBR = 22;
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

        let RequiredtotalAirFlowRate = 0;
        if (module.substring(0, 2) == "BF") {
            RequiredtotalAirFlowRate = parseFloat((TotalMembraneSurfaceArea * 0.3)).toFixed(2);
        }

        let length = 0;
        let width = 0;
        let height = 0;
        let effectiveWaterDepth = 0;
        let width2 = 0;
        let surfaceareapertrain = 0;
        let boxpipe = 0;
        if (TotalNumberOfModule >= 15) {
            boxpipe = 100;
        } else {
            boxpipe = 80;
        }

        if (module == "BF100") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1300 / 1000;
            effectiveWaterDepth = 1.6;
            width2 = 2.3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF100N" || module == "BF125" || module == "BF100oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1300 / 1000;
            effectiveWaterDepth = 1.6;
            width2 = 2.3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF150N" || module == "BF200" || module == "BF200oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 1800 / 1000;
            effectiveWaterDepth = 2.1;
            width2 = 3;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF200N" || module == "BF300") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 2300 / 1000;
            effectiveWaterDepth = 2.7;
            width2 = 4;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        } else if (module == "BF220oxy") {
            length = ((NoofModulePerTrain + 1) * 85 + boxpipe) / 1000;
            width = 700 / 1000;
            height = 2355 / 1000;
            effectiveWaterDepth = 2.77;
            width2 = 4;
            surfaceareapertrain = (Number(length) + 0.6) * (width + 0.6) * (height + 0.7);
        }
        const TotalMembraneTankVolume = parseFloat(surfaceareapertrain).toFixed(2);

        let ModuleSize = "";
        if (module == "BF100" || module == "BF100N" || module == "BF125" || module == "BF100oxy") {
            ModuleSize = "1000 x 534 x 46"
        } else if (module == "BF150N" || module == "BF200" || module == "BF200oxy") {
            ModuleSize = "1500 x 534 x 46"
        } else if (module == "BF200N" || module == "BF300") {
            ModuleSize = "2000 x 534 x 46"
        } else if (module == "BF220oxy") {
            ModuleSize = "2055 x 534 x 46"
        }

        function formatToDDMMYYYY(dateString) {
            const [year, month, day] = dateString.split("-");
            return `${day}-${month}-${year}`;
        }
        const formattedDate = formatToDDMMYYYY(date);

        // --- 2. Load Images & Convert to Uint8Array for docx ---
        if (window.updateProgressBar) await window.updateProgressBar(20, "Loading Image Assets...");
        
        // Using existing helper `loadImage` then converting to ArrayBuffer
        const headerDataUrl = await loadImage('Images for Proposal/header.png');
        const footerDataUrl = await loadImage('Images for Proposal/footer.png');
        const membraneImgDataUrl = await loadImage('Images for Proposal/MembraneImage1.png');
        const pidImgDataUrl = await loadImage('Images for Proposal/MembraneP&ID.jpg');
        const gaImgDataUrl = await loadImage('Images for Proposal/MembraneGADrawing.png');
        const cycleImgDataUrl = await loadImage('Images for Proposal/MBR working cycle programming.png');

        const headerBuffer = base64ToUint8Array(headerDataUrl);
        const footerBuffer = base64ToUint8Array(footerDataUrl);
        const membraneImgBuffer = base64ToUint8Array(membraneImgDataUrl);
        const pidImgBuffer = base64ToUint8Array(pidImgDataUrl);
        const gaImgBuffer = base64ToUint8Array(gaImgDataUrl);
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
                        bottom:30,
                    }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST }, // 0.8cm
                        // alignment of the text inside the table row must be center vertically
                        verticalAlign : VerticalAlign.CENTER,
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
                        bottom:30,
                    }
                        })),
                        // height: { value: 445, rule: HeightRule.AT_LEAST }, // 0.8cm
                        verticalAlign : VerticalAlign.CENTER,
                    })),
                ]
            });
        };

        const createBlueHeaderTable = (headers, rows) => {
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
            // --- Header Row ---
            new TableRow({
                children: headers.map(h => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({ text: h, bold: true, color: "FFFFFF" })],
                        alignment: AlignmentType.CENTER
                    })],
                    shading: { fill: "2980B9" },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                        left: 100,
                        right: 100,
                        top: 40,
                        bottom: 30,
                    }
                })),
                verticalAlign: VerticalAlign.CENTER,
            }),

            // --- Data Rows (Updated for Dark Gray Text) ---
            ...rows.map((row, i) => new TableRow({
                children: row.map(cellText => new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({
                            text: cellText ? String(cellText) : "",
                            color: "444444" // SET DARK GRAY COLOR HERE
                        })]
                    })],
                    shading: { fill: i % 2 === 0 ? "FFFFFF" : "F5F5F5" },
                    margins: {
                        left: 100,
                        right: 100,
                        top: 40,
                        bottom: 30,
                    }
                })),
                verticalAlign: VerticalAlign.CENTER,
            }))
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
                        bottom:30,
                    }
                })),
                // height: { value: 445, rule: HeightRule.AT_LEAST },
                verticalAlign : VerticalAlign.CENTER,
            }),
            ...rows.map(row => new TableRow({
                children: row.map(cellText => new TableCell({
                    children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })],
                    // 2. ADD LEFT/RIGHT MARGIN (PADDING)
                    margins: {
                        left: 100, // ~1.7mm padding
                        right: 100,
                         top: 40,
                        bottom:30,
                    }
                })),
                // height: { value: 445, rule: HeightRule.AT_LEAST },
                verticalAlign : VerticalAlign.CENTER,
            }))
        ]
    });
}

        const sections = [];

        // Spacer for 3 lines (Size 11)
        const spacer = [
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
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
                ], spacing: { line: 380 } }),         
            new Paragraph({ children: [new TextRun({ text: "To:", bold: true })] }),
            //if Client name input has enter then split into multiple lines
            ...client_Name.split('\n').map(line => new Paragraph({ text: line })),
            new Paragraph({ text: "" }), // Space
            new Paragraph({
                children: [
                    new TextRun({ text: "Proposal: ", bold: true, size: 24 }),
                    new TextRun({ text: `Blufox®  ${flowRate}KLD ${treatment_Type}- MBR Membranes`, size: 24 })
                ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
                children: [new ImageRun({ data: membraneImgBuffer, transformation: { width: 400, height: 300 } })],
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
            new Paragraph({ children: [new TextRun({ text: "Product Features", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),


            new Paragraph({ children: [new TextRun({ text: "• Excellent Performance:", bold: true, size: 24})] , indent: { left: 350 } }),
            //set new paragraph font size to 6 according to word size
            new Paragraph({ text: "The Performance of R-PVDF is 10 times better than materials like PES or PS.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• High Strength:", bold: true , size: 24})] , indent: { left: 350 }}),
            new Paragraph({ text: "We adopt the independently developed patent process, which is of higher membrane tensile strength and compressive strength. The tensile resistance can reach 200kg+ and the fiber break age ratio is less than 3%. The Inner Potting material use for holding Fibers is PU with combine of epoxy resin, which gives hollow fiber superior strength in aeration mode.", indent: { left: 350 }}),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Permanent Hydrophilic Membrane:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Based on patent technology, special hydrophilization processing is applied on RPVDF so as to enable a stronger hydrophilic on membrane filaments and still keep its original superior characteristics. Design of the membranes eliminate the dead pockets which results in reduce the bio fouling of the membranes in long term.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Internationally Advanced Membrane Micro-structure:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The sponge-like structure consists of a surface layer of 0.03 - 0.06 micrometers cerebral cortex, with which membrane processes stronger tolerance to run-through, thus ensuring the safety of water outlet.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• High Peeling Strength:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The membrane won the peeled off even after 1million back-flush.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Waste Water Optimization:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Stable effluent quality, high resistance to water quality impact load test. Effluent suspended matter and turbidity are close to zero.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Flexible Operational Control:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The efficient interception of membrane intercepts microorganisms completely in the bioreactor, complete separation of HRT and SRT. Flexible operational control.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Reduce Land and Civil Construction Investment:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The concentration of MBR tank’s activate sludge is around 8,000 – 12,000 mg/l, which both spares the room for sedimentation tank and minimizes land occupation and construction investment. The occupied area is about 1/3 of the traditional process.", indent: { left: 350 } }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 2
        ];

        // --- Page 3 Content ---
        const page3Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "• Reproduction of Nitro bacteria:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "High systematic nitrification efficiency is beneficial to the retention and reproduction of nitrobacteria. Deamination and de-phosphorization may also be realized if the mode of operation is changed.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Improve the Degradation Efficiency:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "The degradation efficiency of refractory organics can be enhanced greatly since the sludge age can be very long.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Can achieve Zero Sludge Discharge:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "Operated under high volumetric loading, low sludge loading, long sludge age, the reactor yields extremely low residual sludge. Due to the infinite sludge age, theoretically zero-release of sludge can be achieved.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "• Easy Operation and Management:", bold: true , size: 24 })], indent: { left: 350 } }),
            new Paragraph({ text: "PLC control of system brings a convenient operation and management process. Simple rack or frame design ensure ease of design as well as maintenance.", indent: { left: 350 } }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            new Paragraph({ children: [new TextRun({ text: "Process Description of MBR Membranes: ", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "MBR tank receives Effluent with the required MLSS after the aeration process. MBR tank consists of MBR membrane modules mounted on structural frame Air diffuser are provided. Below the membrane modules for air scouring" }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "The filtration takes place by means of suction pump which delivers the treated water in the product water tank, a part of the treated water is collected in a overhead backwash water tank. After every 7-8 minutes of service cycle the membranes are subjected to relaxation of 60 seconds. Backwash takes place typically after every 8 Cycle for a period of 1 minutes. In this step, product water from the overhead backwash tank flows by Pump into the membrane module and dislodges the impurities from the membrane surface. Air scouring continues during filtration, rest and backwash period." }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 3
        ];

        // --- Page 4 Content ---
        const page4Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "Standard Operating Conditions:", bold: true, italics: true, color: "00008B", size: 28 })] }),
            createTable(['Parameters', 'Unit', 'Range'], [
                ['Required MLSS', 'mg/lit', '6000-12000'],
                ['Permeate Water Flux', 'LMH', '10-30'],
                ['Air flow Required/Scouring', 'm2/m3/hr', '0.20-0.35'],
                ['Max. Trans Pressure (TMP)', 'mm/Hg (inHg.)', '500(-20)'],
                ['Back Wash Pressure', 'Kg/cm2', '1-1.5'],
                ['DO in MBR Basin', 'mg/l', '1-3'],
                ['MLVSS Ratio', '-', '80%'],
                ['Membrane PH tolerance', '-', '3-10'],
                ['Temperature', 'Degree', '10-40'],
                ['NaClo Tolerance', 'mg/lit (ppm)', '5000'],
            ]),
            new Paragraph({ text: "** Kindly remove Fat, Oil, Grease to protect membranes from fouling and choking, use 1-2mm size fine screen in aeration tank feed line to reduce the heavy TSS stuck to the membranes surface during suction." }),
            new Paragraph({ text: "" }),

            new Paragraph({
                children: [
                    new TextRun({ text: module, bold: true, italics: true, color: "C80000", size: 28 }),
                    new TextRun({ text: " - Membrane Specification", bold: true, italics: true, color: "00008B", size: 28 })
                ]
            }),
            //set table height to 0.8cm

            createTable(['Items', 'Unit'], [
                ['Material of Fiber', 'Reinforced PVDF with PET Layer Support'],
                ['Element Header', 'ABS resin (Heavy Duty)'],
                ['Pore size', '0.03-0.06 Micron (outside - in) '],
                ['Fiber Size (OD/ID)', '2.0mm / 0.9mm'],
                ['Surface Area (MBR)', `${membraneSurfaceAreaPerMBR} m2/module`],
                ['Operation Pressure', '2.95 to17.71 inHg (minus)'],
                ['Backwash Pressure ', 'Max 0.2 MPa'],
                ['Backwash Time ', '30~120 sec.'],
                ['Turbidity outlet', '<1 NTU'],
                ['Element Dimension', `${ModuleSize} mm (Drawing as below)`],
            ]),
            new Paragraph({ children: [new PageBreak()] }) // End Page 4
        ];

        // --- Page 5 Content ---
        const page5Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "Typical P&ID", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({
                children: [new ImageRun({ data: pidImgBuffer, transformation: { width: 600, height: 800 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 5
        ];

        // --- Page 6 Content ---
        const page6Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "MBR Membranes GA Drawing", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({
                children: [new ImageRun({ data: gaImgBuffer, transformation: { width: 600, height: 800 } })],
                alignment: AlignmentType.CENTER
            }),
            new Paragraph({ children: [new PageBreak()] }) // End Page 6
        ];

        // --- Page 7 Content ---

        const page7Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "Offer Parameter", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),
            createTable(['Parameters', 'Unit', 'Range'], [
                ['Flow Rate of the system', 'KLD', `${flowRate}`],
                ['Effective flow Rate (Considering loss of relax & Backwash)', 'm3/hr', `${effectiveFlowRate.toFixed(2)}`],
                ['Design Frame/Train Qty', 'Nos', `${noOfTrain}`],
                ['Per Frame/Train Flow Rate ', 'm3/hr', `${perTrainFlowRate}`],
                ['Design Flux (Avg.)', 'LMH', `${flux}`],
                ['Total MBR Module Required(BLUFOX®)', 'Nos', `${TotalNumberOfModule}`],
                ['Per Frame MBR Module Required', 'No.', `${NoofModulePerTrain}`],
                ['Per Frame MBR Module Surface Area', 'm2', `${MembraneSurfaceAreaPerTrain}`],
                ['Total MBR Membrane Surface Area', 'm2', `${TotalMembraneSurfaceArea}`],
                ['Total MBR Air Required', 'm3/hr', `${RequiredtotalAirFlowRate}`],
                ['MBR Frame/Train Size (Each)', 'L x W x H mm', `${(length * 1000)} x ${((width) * 1000)} x ${(height * 1000)}`],
                ['MBR Frame MOC', '-', `SS304`],
                ['MBR Tank Volume Required (Approx.)', 'm3', `${TotalMembraneTankVolume}`],
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
            new Paragraph({ children: [new PageBreak()] }) // End Page 7
        ];

        // --- Page 8 Content ---
        const page8Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "MBR Feed Limiting Conditions", bold: true, italics: true, color: "00008B", size: 28 })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Customer must ensure the feeding limits for MBR tank shall be as per the below table. In case the MBR feed limits are not meeting as per the below section, it may lead to Membrane damage / failure for which Supplier shall not be responsible." }),
            new Paragraph({ text: "" }),
            createBlueHeaderTable(["#", "Parameter", "Design Value", "Accepted Operating Range", "Units"], [
                ["1", "Membrane tank MLSS concentration", "10000", "8,000-12,000", "mg/L"],
                ["2", "Bioreactor MLSS", "8000", "6,000-10,000", "mg/L"],
                ["3", "Bioreactor MLVSS concentration", "75", ">70%", "MLSS"],
                ["4", "Dissolved oxygen concentration", "2", "1.5-3.0", "mg/L"],
                ["5", "pH of mixed liquor in membrane tanks", "7", "6.5-8.0", "-"],
                ["6", "Total SRT in Bioreactor", "NA", "15-20", "days"],
                ["7", "Soluble cBOD5 in mixed liquor entering membrane tanks", "<5", "≤10", "mg/L"],
                ["8", "NH3-N in mixed liquor entering membrane tanks", "0.5", "≤1", "mg/L"],
                ["9", "Soluble COD", "<50", "<50", "mg/L"],
                ["10", "Total Hardness (as CaCO3)", "-", "Not Scaling", "-"],
                ["11", "Soluble Alkalinity (as CaCO3)", "100", "50-150", "mg/L"],
                ["12", "Colloidal TOC (cTOC) concentration (Note 1)", "7", "≤10", "mg/L"],
                ["13", "Total time to filter (TTF) (Note 2)", "100", "200", "s"],
                ["14", "Mixed liquor recirculation from MBR -> Bioreactor (Note 3)", "4", "4 ± 10%", "4Q"],
                ["15", "Trash/Solids >2mm", "0", "≤2", "mg/L"],
                ["16", "Fats, Oil & Grease (FOG)", "<10 mg/L emulsified oil", "<10 mg/L mineral/non-biodegradable oil", "mg/L"],
                ["17", "Mixed Liquor Temperature", "25", "25-35", "°C"]
            ]),
            new Paragraph({ children: [new PageBreak()] }) // End Page 8
        ];

        // --- Page 9 Content ---
        const page9Children = [
            ...spacer,
            new Paragraph({ children: [new TextRun({ text: "NOTES:", bold: true, size: 24 })] }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "1. Colloidal TOC (cTOC) is the difference between the TOC measured in the filtrate passing through a 1.5 µm filter paper and the TOC measured in the Blufox permeate. TOC measurement shall follow standard water testing methods." }),
            new Paragraph({ text: "2. Per Seller's Time To Filter (TTF) procedure (available upon request)." }),
            new Paragraph({ text: "3. Assuming a MLSS recirculation ratio of 3Q (Pump configuration). Customer to confirm." }),
            new Paragraph({ text: "4. Chemicals incompatible with BLUFOX PVDF membranes must not enter MBR tank (compatibility list available)." }),
            new Paragraph({ text: "5. Biological & membrane process designed for 25-35°C. Avoid >38°C." }),
            new Paragraph({ text: "6. TDS of treated water <3000 ppm. Chlorides <1500 ppm. Sulphates <700 ppm." }),
            new Paragraph({ text: "7. Oil & Grease must not exceed 10 mg/L (emulsified) with no free oil." }),
            new Paragraph({ text: "8. Adequate alkalinity must be maintained for biological performance; chemical dosing may be required." }),
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
            new Paragraph({ children: [new PageBreak()] }) // End Page 9
        ];

        // --- Page 10 Content ---
        const page10Children = [
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
                            new TextRun({ text: "Blufox - MBR Membranes"}),
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
            new Paragraph({ children: [new PageBreak()] }) // End Page 10
        ];

        // --- Page 11 Content (Special Terms + Signatory) ---
        const page11Children = [];
        page11Children.push(...spacer);

        if (special_Terms && special_Terms.trim() !== "") {
            page11Children.push(new Paragraph({ children: [new TextRun({ text: "Special Terms and Conditions:", bold: true, italics: true, color: "00008B", size: 28 })] }));
            page11Children.push(new Paragraph({ text: special_Terms }));
            page11Children.push(new Paragraph({ text: "" }));
        }

        page11Children.push(new Paragraph({ children: [new TextRun({ text: "Authorized Signatory", bold: true, color: "00008B", size: 24 })] }));
        page11Children.push(new Paragraph({ children:[new TextRun({text: authorized_Person, bold: true, color: "00008B", size: 24})]  }));
        page11Children.push(new Paragraph({ children:[new TextRun({text: "Blufox Ecoventures LLP.", bold: true, color: "00008B", size: 24})]  }));
        page11Children.push(new Paragraph({ text: "" }));

        // Add extra images if available (handled safely)
        try {
            // Reuse existing loaded images if possible or new ones. Not defined in original PDF logic block properly so skipping for parity or adding placeholder logic if file names exist
            // For safety based on your prompt "do not change logic", I will assume these images might fail or succeed.
            const extraImg1 = await loadImage('Images for Proposal/Blufox Extra Image 1.png');
            const extraImg2 = await loadImage('Images for Proposal/Blufox Extra Image 2.png');
            const extraImg3 = await loadImage('Images for Proposal/Blufox Extra Image 3.png');

            // Add them side by side? Docx doesn't support float well, simpler to stack or use table. Stacking for safety.
            page11Children.push(
                new Paragraph({
                    children: [
                        new ImageRun({ data: base64ToUint8Array(extraImg1), transformation: { width: 185, height: 185 } }),
                        new TextRun("  "),
                        new TextRun("  "),
                        new TextRun("  "),
                        new ImageRun({ data: base64ToUint8Array(extraImg2), transformation: { width: 185, height: 185 } }),
                        new TextRun("  "),
                        new TextRun("  "),
                        new TextRun("  "),
                        new ImageRun({ data: base64ToUint8Array(extraImg3), transformation: { width: 185, height: 185 } }),
                    ]
                })
            );
        } catch (e) {
            // Ignore if images missing
        }

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
            ...page9Children,
            ...page10Children,
            ...page11Children
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
window.generateBFProposal = generateBFProposal;
window.generateBFWordProposal = generateBFWordProposal;
