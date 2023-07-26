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
                   { "width": "50%", "text": ">>> LOGO <<<" },
                    {
                        "width": "50%",
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
                    { "width": "50%", "text": "TVA = {{VAT}}%" },
                    {
                        "width": "50%",
                        "text": "Curs valutar din {{INVOICE_DATE}}: 1{{EXCHANGE_RATE.from}} = {{EXCHANGE_RATE.conversion_rate}}{{EXCHANGE_RATE.to}}",
                        "alignment": "right"
                    }
                ]
            },
            "\\n",
            {
                "table": {
                    "widths": [15, "*", 20, 25, 50, 50, 50],
                    "body": [
                        [ 
                            {"text":"Nr. crt.", "style":"tableHeader"}, 
                            {"text":"Denumirea produselor sau a serviciilor", "style":"tableHeader"}, 
                            {"text":"UM", "style":"tableHeader"}, 
                            {"text":"Cant.", "style":"tableHeader"},
                            {"text":"Pret unitar (fara TVA)", "style":"tableHeader"},
                            {"text":"Valoarea", "style":"tableHeader"},
                            {"text":"Valoarea TVA", "style":"tableHeader"}
                        ],
                        [ 
                            {"text":"0", "style":"tableHeader"}, 
                            {"text":"1", "style":"tableHeader"},
                            {"text":"2", "style":"tableHeader"},
                            {"text":"3", "style":"tableHeader"},
                            {"text":"4", "style":"tableHeader"},
                            {"text":"5", "style":"tableHeader"},
                            {"text":"6", "style":"tableHeader"}
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            {"text": {{addOne @index}}, "alignment":"center"}, 
                            {"text":"{{this.details}}"},
                            {"text":"{{this.um}}", "alignment":"center"},
                            {"text":"{{this.qty}}", "alignment":"center"},
                            {"text":"{{this.up}}", "alignment":"right"},
                            {"text":"{{toDecimals this.line_value}}", "alignment":"right"},
                            {"text":"{{toDecimals this.line_vat}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            {"text": "{{toDecimals INVOICE_VAT_SUM}}", "bold":true, "alignment":"right"}
                        ],
                        [
                            "","","","",
                            {"text": "TOTAL DE PLATA", "bold":true, "fontSize":13, "alignment":"center"},
                            {"colSpan":2, "text":"\\n{{toDecimals INVOICE_TOTAL}} RON" , "bold":true, "fontSize":13, "alignment":"center"}
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
                                "Nota: Pentru virament bancar, va rog sa folositi mesajul: ",
                                { "text": "{{INVOICE_NUMBER}}", "bold": true }
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
                        "text": "Put the logo here"
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
                            "CONTRACTOR:\\n",
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
                            "VAT N°: {{VAT}}\\n",
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
                                [{ "text": "VAT: {{vat}}%", "style": "tableCell" }]
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
                    "widths": [15, "*", 25, 25, 50, 60],
                    "body": [
                        [
                            { "text": "N°", "style": "tableHeader" },
                            { "text": "Description of services", "style": "tableHeader" },
                            { "text": "MU", "style": "tableHeader" },
                            { "text": "Qty", "style": "tableHeader" },
                            { "text": "Unit Price", "style": "tableHeader" },
                            { "text": "Value", "style": "tableHeader" }
                        ],
                        [
                            { "text": "0", "style": "tableHeader" },
                            { "text": "1", "style": "tableHeader" },
                            { "text": "2", "style": "tableHeader" },
                            { "text": "3", "style": "tableHeader" },
                            { "text": "4", "style": "tableHeader" },
                            { "text": "5", "style": "tableHeader" }
                        ],
                        {{#each INVOICE_LINE}}
                        [
                            { "text": {{addOne @index}}, "alignment": "center" },
                            { "text": "{{this.details}}" },
                            { "text": "{{this.um}}", "alignment": "center" },
                            { "text": "{{this.qty}}", "alignment": "right" },
                            { "text": "{{this.up}}", "alignment": "right" },
                            { "text": "{{toDecimals this.line_value}}", "alignment": "right" }
                        ],
                        {{/each}}
                        [
                            { "colSpan": 2, "text": " " },
                            "",
                            { "colSpan": 3, "text": "INVOICE\\nTOTAL", "bold": true, "fontSize": 13, "alignment": "center" },
                            "", "",
                            { "text": "{{toDecimals INVOICE_TOTAL}} EUR", "bold": true, "fontSize": 13, "alignment": "center" }
                        ]
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
                               {"text":"{{this.details}}"},
                               {"text":"{{this.um}}", "alignment":"center"},
                               {"text":"{{this.qty}}", "alignment":"center"},
                               {"text":"{{this.up}}", "alignment":"right"},
                               {"text":"{{toDecimals this.line_value}}", "alignment":"right"},
                               {"text":"{{toDecimals this.line_vat}}", "alignment":"right"}
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
               { "text": "{{INVOICE_DETAILS}}", "bold":true},
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
                                { "text": "{{INVOICE_NUMBER}", "fontSize": 13, "bold": true },
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
                                "IBAN (IBAN): {{bank_iban}\\n",
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
                            {{@each INVOICE_LINE}}
                            [
                                {"text": {{addOne @index}}, "alignment":"center"}, 
                                {"text":"{{this.details}}"},
                                {"text":"{{this.um}}", "alignment":"center"},
                                {"text":"{{this.qty}}", "alignment":"center"},
                                {"text":"{{this.up}}", "alignment":"right"},
                                {"text":"{{toDecimals this.line_value}}", "alignment":"right"},
                                {"text":"{{toDecimals this.line_vat}}", "alignment":"right"}
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
                { "text": "{{INVOICE_DETAILS}}", "bold":true},                    
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

Handlebars.registerHelper("toDecimals", function(amount) {
    return amount.toFixed(2);
});

Handlebars.registerHelper("addOne", function(integer) {
    return integer + 1;
});
