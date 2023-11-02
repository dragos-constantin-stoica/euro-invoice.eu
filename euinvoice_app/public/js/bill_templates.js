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
                        "image":"data:image/png;base64,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"
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
                        "image":"data:image/png;base64,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"
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
                        "image":"data:image/png;base64,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"
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
    }`,
     
    //English-Romanian template 
    DS0: `{
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
                 "fit": [100, 68],
                 "svg": "<svg width='100' height='68' xmlns='http://www.w3.org/2000/svg'><g><rect rx='10' stroke-dasharray='2,2' id='svg_1' height='64' width='96' y='2' x='2' stroke='#00F' fill='#FFFA8D'/> </g> </svg>"
               },
               {
                 "width": "60%",
                 "text": [
                    { "text": "INVOICE/FACTURA FISCALA\\n", "style": "header" },
                    "Invoice No. (Factura Nr.): ",
                    { "text": "{{INVOICE_NUMBER}}\\n", "fontSize": 13, "bold": true },
                    { "text": "Date (day/month/year) (Data (zi/luna/an)): {{INVOICE_DATE}}\\n" },
                    { "text": "VAT (TVA): {{VAT}}%" }
                 ],
                 "alignment": "right"
               }
           ]
          },
          {
           "canvas": [
             { "type": "line", "x1": 280, "y1":-47, "x2": 520, "y2":-47, "lineWidth": 2 },
             { "type": "line", "x1": 0,   "y1": 10, "x2": 520, "y2": 10,  "lineWidth": 3 }
            ]            
          },
          "\\n",
          {
           "columns": [
            {
             "width": "47%",
             "text": [
               "Supplier (FURNIZOR):\\n",
               {{#with SUPPLIER}}
               { "text": "{{name}}\\n", "bold": true },
               "Nr.Ord.Reg.Com.: {{NRNo}}\\n",
               "VAT Code (C.U.I): {{vat}}\\n",
               "Address (Sediul):\\n{{normalized_address address}}\\n",
               "IBAN (IBAN): {{bank_iban}}\\n",
               "Bank (Banca): {{bank_name}}\\n",
               "SWIFT: {{bank_swift}}"
               {{/with}}
              ]
            },
            { "width": "6%", "text": "" },
            {
              "width": "47%",
              "text": [
                "Customer (BENEFICIAR):\\n",
                {{#with CUSTOMER}}
                { "text": "{{name}}\\n", "bold": true },
                "Nat. Reg. No.: {{NRNo}}\\n",
                "VAT: {{vat}}\\n",
                "Address:\\n{{normalized_address address}}\\n",
                "IBAN: {{bank_iban}}\\n",
                "Bank: {{bank_name}}\\n",
                "SWIFT: {{bank_swift}}\\n",
                "Contact: {{contact}}"
                {{/with}}
              ]
            }   
           ]
          },
          "\\n\\n",
          {
            "table": {
              "widths": [15, "*", 25, 55, 55, 55, 55],
              "body": [
                           [ 
                               {"text":"Nr. crt.", "style":"tableHeader"}, 
                               {"text":"Description of products/services (Denumirea produselor sau a serviciilor)", "style":"tableHeader"}, 
                               {"text":"Unit (UM)", "style":"tableHeader"}, 
                               {"text":"Qty (Cantitate)", "style":"tableHeader"},
                               {"text":"Unit price w/o VAT (Pret unitar fara TVA)\\n-EUR-", "style":"tableHeader"},
                               {"text":"Value (Valoarea)\\n-EUR-", "style":"tableHeader"},
                               {"text":"VAT (Valoarea TVA)\\n-EUR-", "style":"tableHeader"}
                           ],
                           [ 
                               {"text":"0", "style":"tableHeader"}, 
                               {"text":"1", "style":"tableHeader"},
                               {"text":"2", "style":"tableHeader"},
                               {"text":"3", "style":"tableHeader"},
                               {"text":"4", "style":"tableHeader"},
                               {"text":"5 (3x4)", "style":"tableHeader"},
                               {"text":"6 (5xTVA)", "style":"tableHeader"}
                           ],
                           {{#each INVOICE_LINE}}
                           [
                               {"text": "{{addOne @index}}", "alignment":"center"}, 
                               {"text":"{{this.service_product}} {{this.description}}"},
                               {"text":"{{this.unit}}", "alignment":"center"},
                               {"text":"{{this.quantity}}", "alignment":"center"},
                               {"text":"{{this.unit_price}}", "alignment":"right"},
                               {"text":"{{toDecimals this.unit_price this.quantity}}", "alignment":"right"},
                               {"text":"{{toDecimals this.unit_price this.quantity this.vat 0.01}}", "alignment":"right"}
                           ],
                           {{/each}}
                           [
                               {"text": "Subtotal (Subtotal)", "colSpan":5, "bold":true, "alignment":"right"},
                               "","","","",
                               {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                               {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}                 
                           ],
                           [
                               {"colSpan":5, "text": "TOTAL VALUE (Total palta)", "bold":true, "fontSize":13, "alignment":"right"},
                               "","","","",
                               {"colSpan":2, "text":"{{toDecimals INVOICE_TOTAL}}" , "bold":true, "fontSize":13, "alignment":"center"},
                               ""
                           ]
                       ]
                   }
             },
             "\\n",
               { "text": "Exchange rate (Curs) {{INVOICE_DATE}}: 1{{EXCHANGE_RATE.from}} = {{EXCHANGE_RATE.conversion_rate}}{{EXCHANGE_RATE.to}}", "bold":true},
               { "text": "Payment term (Termen de plata): {{INVOICE_DUE_TERM}}"},
               { "text": "{{normalized_address INVOICE_DETAILS}}", "bold":true},
               "\\n\\n\\n",
               {
                   "table": {
                       "widths": ["*"],
                       "body": [
                           [{
                               "text": [
                                   "Due date (Termen de plata): ",
                                   { "text": "{{INVOICE_DUE_DATE}}\\n", "bold": true },
                                   "\\nPlease insert the following message in the payment details\\n(Pentru ordinul de plata, va rog sa treceti la descrierea platii): ",
                                   { "text": "\\n{{INVOICE_NUMBER}}", "bold": true, "alignment":"center" }
                               ],
                               "margin": [5, 5, 33, 5],
                               "fontSize": 13
                           }]
                       ]
                   }
               },
               "\\n\\n\\n",
               { "text": "{{SUPPLIER.name}}", "bold":true},
               { "text": "Tel.: {{SUPPLIER.mobile}}"},
               { "text": "Email: {{SUPPLIER.contact}}", "bold":true}
       ],
           "styles": {
               "header": {
                   "bold": true,
                   "fontSize": 18,
                   "alignment": "right"
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

    //DataStema English version
    DS1:`{
            "pageSize": "A4",
            "pageOrientation": "portrait",
            "pageMargins": [40, 60],
       {{#if DRAFT}}
        "watermark": { "text": "DARFT", "color": "purple", "opacity": 0.2, "angle": -60 },
        {{/if}}
    
            "content": [
                {
                    "columns": [{
                            "fit": [100, 68],
                            "svg": "<svg width='100' height='68' xmlns='http://www.w3.org/2000/svg'> <g>  <rect rx='10' stroke-dasharray='2,2' id='svg_1' height='64' width='96' y='2' x='2' stroke='#00F' fill='#FFFA8D'/> </g> </svg>"
                        },
                        {
                            "width": "60%",
                            "text": [
                                { "text": "INVOICE", "style": "header" },
                                "\\nInvoice No.: ",
                                { "text": "{{INVOICE_NUMBER}}", "fontSize": 13, "bold": true },
                                { "text": "\\nDate (day/month/year): {{INVOICE_DATE}}" },
                                { "text": "\\nVAT: {{VAT}}%" }
                            ],
                            "alignment": "right"
                        }
                    ]
                },
                {
                    "canvas": [
                        { "type": "line", "x1": 280, "y1": -47, "x2": 520, "y2": -47, "lineWidth": 2 },
                        { "type": "line", "x1": 0,   "y1":  10, "x2": 520, "y2":  10, "lineWidth": 3 }
                    ]
                },
                "\\n",
                {
                    "columns": [{
                            "width": "47%",
                            "text": [
                                "Supplier:\\n",
                                {{#with SUPPLIER}}
                                { "text": "{{name}}\\n", "bold": true },
                                "Nat. Reg. No.: {{NRNo}}\\n",
                                "VAT Code: {{vat}}\\n",
                                "Address:\\n{{normalized_address address}}\\n",
                                "IBAN (IBAN): {{bank_iban}}\\n",
                                "Bank (Banca): {{bank_name}}\\n",
                                "BIC: {{bank_bic}}\\n",
                                "Contact: {{contact}}"
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
                                "Customer:\\n",
                                {{#with CUSTOMER}}
                                { "text": "{{name}}\\n", "bold": true },
                                "Nat. Reg. No.: {{NRNo}}\\n",
                                "VAT: {{vat}}\\n",
                                "Address:\\n{{normalized_address address}}\\n",
                                "IBAN: {{bank_iban}}\\n",
                                "Bank: {{bank_name}}\\n",
                                "BIC: {{bank_bic}}\\n",
                                "Contact: {{contact}}"
                                {{/with}}
                            ]
                        }
                    ]
                },
                "\\n\\n",    
                {
                    "table": {
                        "widths": [15, "*", 25, 55, 55, 55, 55],
                        "body": [
                            [ 
                                {"text":"Nr.", "style":"tableHeader"}, 
                                {"text":"Description of products/services", "style":"tableHeader"}, 
                                {"text":"Unit", "style":"tableHeader"}, 
                                {"text":"Quantity", "style":"tableHeader"},
                                {"text":"Unit price w/o VAT\\n-EUR-", "style":"tableHeader"},
                                {"text":"Value\\n-EUR-", "style":"tableHeader"},
                                {"text":"VAT\\n-EUR-", "style":"tableHeader"}
                            ],
                            [ 
                                {"text":"0", "style":"tableHeader"}, 
                                {"text":"1", "style":"tableHeader"},
                                {"text":"2", "style":"tableHeader"},
                                {"text":"3", "style":"tableHeader"},
                                {"text":"4", "style":"tableHeader"},
                                {"text":"5 (3x4)", "style":"tableHeader"},
                                {"text":"6 (5xTVA)", "style":"tableHeader"}
                            ],
                            {{#each INVOICE_LINE}}
                            [
                                {"text": {{addOne @index}}, "alignment":"center"}, 
                                {"text":"{{this.service_product}} {{this.description}}"},
                                {"text":"{{this.unit}}", "alignment":"center"},
                                {"text":"{{this.quantity}}", "alignment":"center"},
                                {"text":"{{this.unit_price}}", "alignment":"right"},
                                {"text":"{{toDecimals this.unit_price this.quantity}}", "alignment":"right"},
                                {"text":"{{toDecimals this.unit_price this.quantity this.vat 0.01}}", "alignment":"right"}
                            ],
                            {{/each}}
                            [
                                {"text": "SUBTOTAL", "colSpan":5, "bold":true, "alignment":"right"},
                                "","","","",
                                {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                                {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}                                
                            ],
                            [
                                {"colSpan":5, "text": "TOTAL VALUE", "bold":true, "fontSize":13, "alignment":"right"},
                                "","","","",
                                {"colSpan":2, "text":"{{toDecimals INVOICE_TOTAL}}" , "bold":true, "fontSize":13, "alignment":"center"},
                                ""                                
                            ]
                        ]
                    }
                },
                "\\n",
                { "text": "Payment term (Termen de plata): {{INVOICE_DUE_TERM}}"},
                { "text": "{{normalized_address INVOICE_DETAILS}}", "bold":true},                    
                "\\n\\n\\n",                
                {
                    "table": {
                        "widths": ["*"],
                        "body": [
                            [{
                                "text": [
                                    "Due date: ",
                                    { "text": "{{INVOICE_DUE_DATE}}\\n", "bold": true },
                                    "\\nPlease insert the following message in the payment details:\\n",
                                    { "text": "{{INVOICE_NUMBER}}", "bold": true, "alignment":"center" }
                                ],
                                "margin": [5, 5, 33, 5],
                                "fontSize": 13
                            }]
                        ]
                    }
                },
                "\\n\\n\\n",
                { "text": "{{SUPPLIER.name}}", "bold":true},
                { "text": "Tel.: {{SUPPLIER.mobile}}"},
                { "text": "Email: {{SUPPLIER.contact}}", "bold":true}                
            ],
            "styles": {
                "header": {
                    "bold": true,
                    "fontSize": 18,
                    "alignment": "right"
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
