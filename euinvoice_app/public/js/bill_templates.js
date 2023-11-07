/**
 * PDF templates that will be rendered with Handlebar
 * JSON objects that contain blocks
 */
const templates = {

    //ROMANIAN template
    RO: `{
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],
        {{#if DRAFT}}
        "watermark": { "text": "DARFT", "color": "purple", "opacity": 0.2, "angle": -60 },
        {{/if}}

        "content": [
            {
                "columns": [
                    {
                        "width":80,
                        "image": ""
                    },
                    {
                        "width": "80%",
                        "text": [
                            "NR. Factura: ",
                            { "text": "{{INVOICE_NUMBER}}", "fontSize": 13, "bold": true }
                        ],
                        "alignment": "right"
                    }
                ]
            },
            "\\n\\n",
            { "text": "FACTURA FISCALA", "style": "header" },
            "\\n\\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "FURNIZOR:\\n",
                            {{#with SUPPLIER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NRNo}}\\n",
                            "Cod T.V.A: {{vat}}\\n",
                            "Sediul: {{normalized_address address}}\\n",
                            "Banca: {{bank_name}}\\n",
                            "Cod IBAN: {{bank_iban}}"
                            {{/with}}
                        ]
                    },
                    { "width": "6%", "text": "" },
                    {
                        "width": "47%",
                        "text": [
                            "BENEFICIAR:\\n",
                            {{#with CUSTOMER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NRNo}}\\n",
                            "Cod T.V.A: {{vat}}\\n",
                            "Sediul: {{normalized_address address}}\\n",
                            "Banca: {{bank_name}}\\n",
                            "Cont IBAN: {{bank_iban}}"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [
                   { "width": "33%", "text": "" },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Numar factura: {{INVOICE_NUMBER}}", "style": "tableCell" }],
                                [{ "text": "Data emiterii: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "Data scadentei: {{INVOICE_DUE_DATE}}", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    { "width": "33%", "text": "" }
                ]

            },
            "\\n\\n",
            {
                "columns": [
                    {
                        "width": "50%",
                        "text": "Curs valutar din {{INVOICE_DATE}}: 1 {{EXCHANGE_RATE.from}} = {{EXCHANGE_RATE.conversion_rate}} {{EXCHANGE_RATE.to}}",
                        "alignment": "right"
                    }
                ]
            },
            "\\n",
            {
                "table": {
                    "widths": [15, "*", 20, 25, 50, 50, 30, 50],
                    "body": [
                        [ 
                            {"text":"Nr. crt.", "style":"tableHeader"}, 
                            {"text":"Denumirea produselor sau a serviciilor", "style":"tableHeader"}, 
                            {"text":"UM", "style":"tableHeader"}, 
                            {"text":"Cant.", "style":"tableHeader"},
                            {"text":"Pret unitar (fara TVA)", "style":"tableHeader"},
                            {"text":"Valoarea", "style":"tableHeader"},
                            {"text":"TVA%", "style":"tableHeader"},
                            {"text":"Valoarea TVA", "style":"tableHeader"}
                        ],
                        [ 
                            {"text":"0", "style":"tableHeader"}, 
                            {"text":"1", "style":"tableHeader"},
                            {"text":"2", "style":"tableHeader"},
                            {"text":"3", "style":"tableHeader"},
                            {"text":"4", "style":"tableHeader"},
                            {"text":"5 (3x4)", "style":"tableHeader"},
                            {"text":"6", "style":"tableHeader"},
                            {"text":"7 (5x6)", "style":"tableHeader"}
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            {"text": {{addOne @index}}, "alignment":"center"}, 
                            {"text":"{{this.service_product}} {{this.description}}"},
                            {"text":"{{this.unit}}", "alignment":"center"},
                            {"text":"{{this.quantity}}", "alignment":"center"},
                            {"text":"{{toDecimals this.unit_price}}", "alignment":"right"},
                            {"text":"{{toDecimals this.unit_price this.quantity}}", "alignment":"right"},
                            {"text":"{{toDecimals this.vat}}", "alignment":"right"},
                            {"text":"{{toDecimals this.unit_price this.quantity this.vat 0.01}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            "",
                            {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}
                        ],
                        [
                            "","","","",
                            {"text": "TOTAL DE PLATA", "bold":true, "fontSize":13, "alignment":"center"},
                            {"colSpan":3, "text":"\\n{{toDecimals INVOICE_TOTAL}} {{EXCHANGE_RATE.from}}" , "bold":true, "fontSize":13, "alignment":"center"}
                        ]
                    ]
                }
            },
            "\\n\\n",
            {
                "table": {
                    "widths": ["*"],
                    "body": [
                        [{
                            "text": [
                                "Termen de plata: ",
                                { "text": "{{INVOICE_DUE_DATE}}\\n", "bold": true },
                                "Nota: Pentru virament bancar, folositi mesajul:\\n\\n",
                                { "text": "{{normalized_address INVOICE_DETAILS}}", "bold":true, "alignment":"center"}
                            ],
                            "margin": [5, 5, 33, 5],
                            "fontSize": 13
                        }]
                    ]
                }
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "50%",
                        "text": "Semnatura si stampila furnizorului"
                    },
                    {
                        "width": "50%",
                        "text": "Semnatura de primire beneficiar",
                        "alignment": "right"
                    }
                ]
            }
        ],
        "styles": {
            "header": {
                "bold": true,
                "fontSize": 18,
                "alignment": "center"
            },
            "tableHeader": {
                "color": "black",
                "alignment": "center"
            },
            "tableCell": {
                "margin": [3, 5, 3, 5]
            }
        },
        "defaultStyle": {
            "fontSize": 10
        }
    }`,

    //ENGLISH template    
    EN: `{
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        {{#if DRAFT}}
        "watermark": { "text": "DARFT", "color": "purple", "opacity": 0.2, "angle": -60 },
        {{/if}}

        "content": [
            {
                "columns": [
                    {
                        "width":80,
                        "image":""
                    },
                    {
                        "width": "80%",
                        "text": [
                            " Invoice N°. ",
                            { "text": "{{INVOICE_NUMBER}}", "fontSize": 13, "bold": true }
                        ],
                        "alignment": "right"
                    }
                ]
            },
            "\\n\\n",
            { "text": "INVOICE", "style": "header" },
            "\\n\\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "SUPPLIER:\\n",
                            {{#with SUPPLIER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "VAT N°: {{vat}}\\n",
                            "Address: {{normalized_address address}}\\n",
                            "Bank: {{bank_name}}\\n",
                            "IBAN: {{bank_iban}}\\n",
                            "SWIFT: {{bank_swift}}\\n",
                            "BIC: {{bank_bic}}"
                            {{/with}}
                        ]
                    },
                    {
                        "width": "6%",
                        "text": ""
                    },
                    {
                        "width": "47%",
                        "text": [
                            "BILL TO:\\n",
                            {{#with CUSTOMER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "VAT N°: {{vat}}\\n",
                            "Address: {{normalized_address address}}\\n"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{ "width": "33%", "text": "" },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Invoice: {{INVOICE_NUMBER}}", "style": "tableCell" }],
                                [{ "text": "Invoice date: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "Invoice due date: {{INVOICE_DUE_DATE}}", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    { "width": "33%", "text": "" }
                ]

            },
            "\\n\\n",
            {
                "table": {
                    "widths": [15, "*", 20, 25, 50, 50, 30, 50],
                    "body": [
                        [
                            { "text": "N°", "style": "tableHeader" },
                            { "text": "Description of services", "style": "tableHeader" },
                            { "text": "MU", "style": "tableHeader" },
                            { "text": "Qty", "style": "tableHeader" },
                            { "text": "Unit Price", "style": "tableHeader" },
                            { "text": "Value", "style": "tableHeader" },
                            { "text": "TVA%", "style":"tableHeader"},
                            { "text": "Value VAT", "style":"tableHeader"}
                        ],
                        [
                            { "text": "0", "style": "tableHeader" },
                            { "text": "1", "style": "tableHeader" },
                            { "text": "2", "style": "tableHeader" },
                            { "text": "3", "style": "tableHeader" },
                            { "text": "4", "style": "tableHeader" },
                            { "text": "5 (3x4)", "style":"tableHeader"},
                            { "text": "6", "style":"tableHeader"},
                            { "text": "7 (5x6)", "style":"tableHeader"}
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            { "text": {{addOne @index}}, "alignment": "center" },
                            { "text": "{{this.service_product}} {{this.description}}" },
                            { "text": "{{this.unit}}", "alignment": "center" },
                            { "text": "{{this.quantity}}", "alignment": "right" },
                            { "text": "{{toDecimals this.unit_price}}", "alignment": "right" },
                            {"text":"{{toDecimals this.unit_price this.quantity}}", "alignment":"right"},
                            {"text":"{{toDecimals this.vat}}", "alignment":"right"},
                            {"text":"{{toDecimals this.unit_price this.quantity this.vat 0.01}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            "",
                            {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}
                        ],
                        [
                            "","","","",
                            {"text": "INVOICE TOTAL", "bold":true, "fontSize":13, "alignment":"center"},
                            {"colSpan":3, "text":"\\n{{toDecimals INVOICE_TOTAL}} {{EXCHANGE_RATE.from}}" , "bold":true, "fontSize":13, "alignment":"center"}
                        ]
                    ]
                }
            },
            "\\n\\n",
            {
                "table": {
                    "widths": ["*"],
                    "body": [
                        [{
                            "text": [
                                "Due date: ",
                                { "text": "{{INVOICE_DUE_DATE}}\\n", "bold": true },
                                "Note: Use the following message for bank transfer:\\n\\n",
                                { "text": "{{normalized_address INVOICE_DETAILS}}", "bold":true, "alignment":"center"}
                            ],
                            "margin": [5, 5, 33, 5],
                            "fontSize": 13
                        }]
                    ]
                }
            },
            "\\n\\n",
            {
                "columns": [{
                    "width": "50%",
                    "text": "Contractor's signature"
                }]
            }
        ],
        "styles": {
            "header": {
                "bold": true,
                "fontSize": 18,
                "alignment": "center"
            },
            "tableHeader": {
                "color": "black",
                "alignment": "center"
            },
            "tableCell": {
                "margin": [3, 5, 3, 5]
            }
        },
        "defaultStyle": {
            "fontSize": 10
        }
    }`,

    //ENGLISH template    
    FR: `{
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        {{#if DRAFT}}
        "watermark": { "text": "BROUILLON", "color": "purple", "opacity": 0.2, "angle": -60 },
        {{/if}}

        "content": [
            {
                "columns": [
                    {
                        "width":80,
                        "image":""
                    },
                    {
                        "width": "80%",
                        "text": [
                            " Facture N°. ",
                            { "text": "{{INVOICE_NUMBER}}", "fontSize": 13, "bold": true }
                        ],
                        "alignment": "right"
                    }
                ]
            },
            "\\n\\n",
            { "text": "FACTURE", "style": "header" },
            "\\n\\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "Fournisseur:\\n",
                            {{#with SUPPLIER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "N° TVA: {{vat}}\\n",
                            "Adresse: {{normalized_address address}}\\n",
                            "Banque: {{bank_name}}\\n",
                            "IBAN: {{bank_iban}}\\n",
                            "SWIFT: {{bank_swift}}\\n",
                            "BIC: {{bank_bic}}"
                            {{/with}}
                        ]
                    },
                    {
                        "width": "6%",
                        "text": ""
                    },
                    {
                        "width": "47%",
                        "text": [
                            "Client:\\n",
                            {{#with CUSTOMER}}
                            { "text": "{{name}}\\n", "bold": true },
                            "N° TVA: {{vat}}\\n",
                            "Adresse: {{normalized_address address}}\\n"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{ "width": "33%", "text": "" },
                    {
                        "table": {
                            "body": [
                                [{ "text": "FACTURE: {{INVOICE_NUMBER}}", "style": "tableCell" }],
                                [{ "text": "Date de facturation: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "Facture a payer avant le: {{INVOICE_DUE_DATE}}", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    { "width": "33%", "text": "" }
                ]

            },
            "\\n\\n",
            {
                "table": {
                    "widths": [15, "*", 20, 25, 50, 50, 30, 50],
                    "body": [
                        [
                            { "text": "N°", "style": "tableHeader" },
                            { "text": "Description de services", "style": "tableHeader" },
                            { "text": "UM", "style": "tableHeader" },
                            { "text": "Qte", "style": "tableHeader" },
                            { "text": "Prix unitaire", "style": "tableHeader" },
                            { "text": "HTVA", "style": "tableHeader" },
                            { "text": "TVA%", "style":"tableHeader"},
                            { "text": "TVA", "style":"tableHeader"}
                        ],
                        [
                            { "text": "0", "style": "tableHeader" },
                            { "text": "1", "style": "tableHeader" },
                            { "text": "2", "style": "tableHeader" },
                            { "text": "3", "style": "tableHeader" },
                            { "text": "4", "style": "tableHeader" },
                            { "text": "5 (3x4)", "style":"tableHeader"},
                            { "text": "6", "style":"tableHeader"},
                            { "text": "7 (5x6)", "style":"tableHeader"}
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            { "text": {{addOne @index}}, "alignment": "center" },
                            { "text": "{{this.service_product}} {{this.description}}" },
                            { "text": "{{this.unit}}", "alignment": "center" },
                            { "text": "{{this.quantity}}", "alignment": "right" },
                            { "text": "{{toDecimals this.unit_price}}", "alignment": "right" },
                            {"text":"{{toDecimals this.unit_price this.quantity}}", "alignment":"right"},
                            {"text":"{{toDecimals this.vat}}", "alignment":"right"},
                            {"text":"{{toDecimals this.unit_price this.quantity this.vat 0.01}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            "",
                            {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}
                        ],
                        [
                            "","","","",
                            {"text": "TOTAL A PAYER", "bold":true, "fontSize":13, "alignment":"center"},
                            {"colSpan":3, "text":"\\n{{toDecimals INVOICE_TOTAL}} {{EXCHANGE_RATE.from}}" , "bold":true, "fontSize":13, "alignment":"center"}
                        ]
                    ]
                }
            },
            "\\n\\n",
            {
                "table": {
                    "widths": ["*"],
                    "body": [
                        [{
                            "text": [
                                "Date limite de payement: ",
                                { "text": "{{INVOICE_DUE_DATE}}\\n", "bold": true },
                                "Note: communication structuee a utiliser lors de payement:\\n\\n",
                                { "text": "{{normalized_address INVOICE_DETAILS}}", "bold":true, "alignment":"center"}
                            ],
                            "margin": [5, 5, 33, 5],
                            "fontSize": 13
                        }]
                    ]
                }
            },
            "\\n\\n",
            {
                "columns": [{
                    "width": "50%",
                    "text": "Signature Fourniseur"
                }]
            }
        ],
        "styles": {
            "header": {
                "bold": true,
                "fontSize": 18,
                "alignment": "center"
            },
            "tableHeader": {
                "color": "black",
                "alignment": "center"
            },
            "tableCell": {
                "margin": [3, 5, 3, 5]
            }
        },
        "defaultStyle": {
            "fontSize": 10
        }
    }`
       
};


Handlebars.registerHelper("normalized_address", function(address) {
    return new Handlebars.SafeString(address.replace(/(?:\r\n|\r|\n)/g, "\\n"));
});

Handlebars.registerHelper("toDecimals", function(...terms) {
    let acc = 1.0
    terms.pop()
    for (const arg of terms){
        acc *= Number.parseFloat(arg)
    }
    return acc.toFixed(2);
});

Handlebars.registerHelper("addOne", function(integer) {
    return integer + 1;
});
