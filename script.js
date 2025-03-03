document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;

    // Get Form Elements
    const companyName = document.getElementById("companyName");
    const clientName = document.getElementById("clientName");
    const invoiceDate = document.getElementById("invoiceDate");
    const invoiceNumber = document.getElementById("invoiceNumber");
    const dueDate = document.getElementById("dueDate");
    const notes = document.getElementById("notes");

    // Preview Elements
    const previewCompanyName = document.getElementById("previewCompanyName");
    const previewClientName = document.getElementById("previewClientName");
    const previewInvoiceDate = document.getElementById("previewInvoiceDate");
    const previewInvoiceNumber = document.getElementById("previewInvoiceNumber");
    const previewDueDate = document.getElementById("previewDueDate");
    const previewNotes = document.getElementById("previewNotes");
    const previewItems = document.getElementById("previewItems");
    const previewTotal = document.getElementById("previewTotal");

    // Section Visibility Toggles with Unique IDs
    const sectionToggles = {
        toggleCompanySection: "companySectionPreview",
        toggleClientSection: "clientSectionPreview",
        toggleInvoiceDetailsSection: "invoiceDetailsSectionPreview",
        toggleItemsSection: "itemsSectionPreview",
        toggleNotesSection: "notesSectionPreview"
    };

    function updatePreview() {
        function setTextOrHide(input, previewElement, label) {
                previewElement.innerHTML = `<strong>${label}:</strong> ${input.value}`;
        }
    
        setTextOrHide(document.getElementById("companyName"), document.getElementById("previewCompanyName"), "Company Name");
        setTextOrHide(document.getElementById("companyAddress"), document.getElementById("previewCompanyAddress"), "Address");
        setTextOrHide(document.getElementById("companyEmail"), document.getElementById("previewCompanyEmail"), "Email");
        setTextOrHide(document.getElementById("companyPhone"), document.getElementById("previewCompanyPhone"), "Phone");
        setTextOrHide(document.getElementById("clientName"), document.getElementById("previewClientName"), "Client Name");
        setTextOrHide(document.getElementById("clientAddress"), document.getElementById("previewClientAddress"), "Client Address");
        setTextOrHide(document.getElementById("invoiceNumber"), document.getElementById("previewInvoiceNumber"), "Invoice #");
        setTextOrHide(document.getElementById("invoiceDate"), document.getElementById("previewInvoiceDate"), "Invoice Date");
        setTextOrHide(document.getElementById("dueDate"), document.getElementById("previewDueDate"), "Due Date");
        setTextOrHide(document.getElementById("notes"), document.getElementById("previewNotes"), "Notes");
    }
    

    [companyName, clientName, invoiceDate, invoiceNumber, dueDate, notes].forEach(input => {
        input.addEventListener("input", updatePreview);
    });

    function updateVisibility() {
        Object.keys(sectionToggles).forEach(toggleId => {
            const section = document.getElementById(sectionToggles[toggleId]);
            const checkbox = document.getElementById(toggleId);
            if (section && checkbox) {
                section.style.display = checkbox.checked ? "block" : "none";
            }
        });
    }

    Object.keys(sectionToggles).forEach(toggleId => {
        document.getElementById(toggleId).addEventListener("change", updateVisibility);
    });

    updateVisibility();

    // Handle Logo Upload
    document.getElementById("companyLogo").addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgElement = document.getElementById("previewInvoiceLogo");
                imgElement.src = e.target.result;
                imgElement.style.display = "block";
                imgElement.style.maxWidth = "120px";
                imgElement.style.maxHeight = "60px";
                imgElement.style.objectFit = "contain";
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById("addItem").addEventListener("click", function () {
        const itemRow = document.createElement("div");
        itemRow.classList.add("row", "mt-2");
    
        itemRow.innerHTML = `
            <div class="col-md-5">
                <input type="text" class="form-control item-desc" placeholder="Item Description">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control item-qty" placeholder="Qty" min="1">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control item-price" placeholder="Price" min="0">
            </div>
            <div class="col-md-1 d-flex align-items-center">
                <button class="btn btn-danger remove-item">✖</button>
            </div>
        `;
    
        document.getElementById("itemsList").appendChild(itemRow);
    
        // Attach event listener for item removal
        itemRow.querySelector(".remove-item").addEventListener("click", function () {
            itemRow.remove();
            updateInvoicePreview();
        });
    
        // Update preview whenever an item is added or changed
        itemRow.querySelectorAll("input").forEach(input => {
            input.addEventListener("input", updateInvoicePreview);
        });
    
        updateInvoicePreview(); // Ensure preview updates after adding an item
    });
    
    function updateInvoicePreview() {
        let items = document.querySelectorAll(".item-desc");
        let qtys = document.querySelectorAll(".item-qty");
        let prices = document.querySelectorAll(".item-price");
    
        previewItems.innerHTML = "";
        let total = 0;
    
        items.forEach((item, index) => {
            let desc = item.value.trim();
            let qty = parseInt(qtys[index].value) || 1;
            let price = parseFloat(prices[index].value) || 0;
            let itemTotal = qty * price;
            total += itemTotal;
    
            if (desc !== "") {  // Only add if description exists
                let row = `
                    <tr>
                        <td>${desc}</td>
                        <td>${qty}</td>
                        <td>$${price.toFixed(2)}</td>
                        <td>$${itemTotal.toFixed(2)}</td>
                    </tr>
                `;
                previewItems.innerHTML += row;
            }
        });
    
        previewTotal.textContent = `Total: $${total.toFixed(2)}`;
    }
    

    document.getElementById("generateInvoice").addEventListener("click", function () {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });
    
        let invoiceElement = document.querySelector(".invoice-preview");
    
        html2canvas(invoiceElement, {
            scale: 3, // Higher scale for better resolution
            useCORS: true,
        }).then((canvas) => {
            let imgData = canvas.toDataURL("image/png");
    
            let pageWidth = doc.internal.pageSize.getWidth();
            let pageHeight = doc.internal.pageSize.getHeight();
    
            let imgWidth = pageWidth - 20;
            let imgHeight = (canvas.height * imgWidth) / canvas.width;
    
            if (imgHeight > pageHeight - 20) {
                imgHeight = pageHeight - 20;
                imgWidth = (canvas.width * imgHeight) / canvas.height;
            }
    
            doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight, "", "FAST");
            doc.save("invoice.pdf");
    
            // Show animation
            const pdfAnimation = document.getElementById("pdfAnimation");
            pdfAnimation.style.display = "block";
            setTimeout(() => {
                pdfAnimation.style.opacity = "1";
            }, 100);
    
            // Hide after 2 seconds
            setTimeout(() => {
                pdfAnimation.style.opacity = "0";
                setTimeout(() => {
                    pdfAnimation.style.display = "none";
                }, 500);
            }, 2000);
        });
    });
    
});
    