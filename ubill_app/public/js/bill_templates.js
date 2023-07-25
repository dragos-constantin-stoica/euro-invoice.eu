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
                "columns": [{
                        "width": "50%",
                        "text": "Exemplarul nr. 1/1"
                    },
                    {
                        "width": "50%",
                        "text": [
                            "SERIA: ",
                            { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                            " NR.: ",
                            { "text": "{{NUMARUL}}", "fontSize": 13, "bold": true }
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
                            {{#with FURNIZOR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NORG}}\\n",
                            "C.U.I: {{CUI}}\\n",
                            "Sediul: {{normalized_address adresa}}\\n",
                            "Banca: {{banca}} - Sucursala: {{sucursala}}\\n",
                            "Cod IBAN: {{IBAN}}"
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
                            "BENEFICIAR:\\n",
                            {{#with BENEFICIAR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "Nr.Ord.Reg.Com.: {{NORG}}\\n",
                            "C.U.I: {{CUI}}\\n",
                            "Sediul: {{normalized_address adresa}}\\n",
                            "Banca: {{banca}} - Sucursala: {{sucursala}}\\n",
                            "Cont IBAN: {{IBAN}}"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "33%",
                        "text": ""
                    },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Numar factura: {{NUMARUL}}", "style": "tableCell" }],
                                [{ "text": "Data emiterii: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "Data scadentei: {{DUE_DATE}}", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    {
                        "width": "33%",
                        "text": ""
                    }

                ]

            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "50%",
                        "text": "Cota TVA = {{TVA}}%"
                    },
                    {
                        "width": "50%",
                        "text": "Curs BNR din {{CURS_BNR.data}}: 1EUR = {{CURS_BNR.eur_ron}}RON",
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
                            {"text":"{{toDecimals this.line_tva}}", "alignment":"right"}
                        ],
                        {{/each}}
                        [
                            {"colSpan":4, "rowSpan":2, "text":" "},
                            "","","",
                            {"text": "TOTAL", "bold":true, "alignment":"center"},
                            {"text": "{{toDecimals INVOICE_SUM}}", "bold":true, "alignment":"right"},
                            {"text": "{{toDecimals INVOICE_TVA_SUM}}", "bold":true, "alignment":"right"}
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
                                { "text": "{{DUE_DATE}}\\n", "bold": true },
                                "Nota: Pentru ordinul de plata, va rog sa treceti la descrierea platii: ",
                                { "text": "{{SERIA}}-{{NUMARUL}}", "bold": true }
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
                            "SERIES: ",
                            { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                            " N°. ",
                            { "text": "{{NUMARUL}}", "fontSize": 13, "bold": true },
                            "\\n\\n",
                            { "text": "Copy N°. 1 of 1" }
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
                            {{#with FURNIZOR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "VAT N°: {{TVA}}\\n",
                            "Address: {{normalized_address adresa}}\\n",
                            "Bank: {{banca}} - Office: {{sucursala}}\\n",
                            "IBAN: {{IBAN}}\\n",
                            "SWIFT: {{SWIFT}}\\n",
                            "BIC: {{BIC}}"
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
                            {{#with BENEFICIAR}}
                            { "text": "{{nume}}\\n", "bold": true },
                            "VAT N°: {{TVA}}\\n",
                            "Address: {{normalized_address adresa}}\\n"
                            {{/with}}
                        ]
                    }
                ]
            },
            "\\n\\n",
            {
                "columns": [{
                        "width": "33%",
                        "text": ""
                    },
                    {
                        "table": {
                            "body": [
                                [{ "text": "Invoice: {{SERIA}}/{{NUMARUL}}", "style": "tableCell" }],
                                [{ "text": "Invoice date: {{INVOICE_DATE}}", "style": "tableCell" }],
                                [{ "text": "VAT: {{TVA}}%", "style": "tableCell" }]
                            ],
                            "widths": [180]
                        }
                    },
                    {
                        "width": "33%",
                        "text": ""
                    }

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

/*
// playground requires you to assign document definition to a variable called dd

var dd = {
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        "content": [
            {
                "columns": [{
                        fit: [100, 68],
                        svg: `<svg version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 130 129">
            <g>
                <image width="130" height="129" preserveAspectRatio="none" style="image-rendering:optimizeQuality"
                xlink:href="data:image/png;base64,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 vstqm6zi/wGwBpW/WYFRdwAAAABJRU5ErkJggg== "
                id="image832" />
        </g>
</svg>`
                },
                {
                    "width": "60%",
                    "text": [
                        { "text": "INVOICE/FACTURA FISCALA", "style": "header" },
                        "\nInvoice No. (Factura Nr.): ",
                        { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                        { "text": "\nDate (day/month/year) (Data (zi/luna/an)): {{INVOICE_DATE}}" },
                        { "text": "\nVAT% (TVA): {{TVA}}%" },
                    ],
                    "alignment": "right"
                }
            ]
        },
        {
            canvas: [
                {
                  type: 'line',
                  x1: 280, y1: -47,
                  x2: 520, y2: -47,
                  lineWidth: 2,
                },
                {
                  type: 'line',
                  x1: 0, y1: 10,
                  x2: 520, y2: 10,
                  lineWidth: 3,
                }
            ]
                
        },
        "\n",
        {
            "columns": [{
                    "width": "47%",
                    "text": [
                        "Supplier (FURNIZOR):\n",
                        { "text": "{{nume}}\n", "bold": true },
                        "Nr.Ord.Reg.Com.: {{NORG}}\n",
                        "VAT Code (C.U.I): {{CUI}}\n",
                        "Address (Sediul):\n{{adresa}}\n",
                        "IBAN (IBAN): {{IBAN}}\n",
                        "Bank (Banca): {{banca}}\n",
                        "SWIFT: {{swift}}",
                    ]
                },
                {
                    "width": "6%",
                    "text": ""
                },
                {
                    "width": "47%",
                    "text": [
                        "Customer (BENEFICIAR):\n",
                        { "text": "{{nume}}\n", "bold": true },
                        "Nat. Reg. No.: {{NORG}}\n",
                        "VAT: {{CUI}}\n",
                        "Address:\n{{adresa}}\n",
                        "IBAN: {{IBAN}}\n",
                        "Bank: {{banca}}\n",
                        "SWIFT: {{swift}}\n",
                        "Contact: {{contact}}"
                        
                    ]
                }
            ]
        },
        "\n\n",

        {
            "table": {
                "widths": [15, "*", 25, 55, 55, 55, 55],
                "body": [
                    [ 
                        {"text":"Nr. crt.", "style":"tableHeader"}, 
                        {"text":"Description of products/services (Denumirea produselor sau a serviciilor)", "style":"tableHeader"}, 
                        {"text":"Unit (UM)", "style":"tableHeader"}, 
                        {"text":"Qty (Cantitate)", "style":"tableHeader"},
                        {"text":"Unit price w/o VAT (Pret unitar fara TVA)\n-EUR-", "style":"tableHeader"},
                        {"text":"Value (Valoarea)\n-EUR-", "style":"tableHeader"},
                        {"text":"VAT (Valoarea TVA)\n-EUR-", "style":"tableHeader"}
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
                    [
                        {"text": 1, "alignment":"center"}, 
                        {"text":"{{details}}"},
                        {"text":"{{um}}", "alignment":"center"},
                        {"text":"{{qty}}", "alignment":"center"},
                        {"text":"{{up}}", "alignment":"right"},
                        {"text":"{{line_value}}", "alignment":"right"},
                        {"text":"{{line_tva}}", "alignment":"right"}
                    ],
                    [
                        {"text": "Subtotal (Subtotal)", "colSpan":5, "bold":true, "alignment":"right"},
                        '','','','',
                        {"text": "INVOICE_SUM", "bold":true, "alignment":"right"},
                        {"text": "INVOICE_TVA_SUM", "bold":true, "alignment":"right"},
                        
                    ],
                    [
                        {"colSpan":5, "text": "TOTAL VALUE (Total palta)", "bold":true, "fontSize":13, "alignment":"right"},
                        '','','','',
                        {"colSpan":2, "text":"TOTAL_INVOICE" , "bold":true, "fontSize":13, "alignment":"center"},
                        ''
                        
                    ]
                ]
            }
        },
        "\n",
        { "text": "Exchange rate (Curs {{CURS_BNR.data}}): 1EUR = {{CURS_BNR.eur_ron}}RON", bold:true},
        { "text": "Payment term (Termen de plata): {{due_term}}"},
        { text: "{{invoice_details}}", bold:true},
            
        "\n\n\n",
        
        {
            "table": {
                "widths": ["*"],
                "body": [
                    [{
                        "text": [
                            "Due date (Termen de plata): ",
                            { "text": "{{DUE_DATE}}\n", "bold": true },
                            "\nPlease insert the following message in the paymenr details\n(Pentru ordinul de plata, va rog sa treceti la descrierea platii): ",
                            { "text": "\n{{SERIA}}-{{NUMARUL}}", "bold": true, alignment:"center" }
                        ],
                        "margin": [5, 5, 33, 5],
                        "fontSize": 13
                    }]
                ]
            }
        },
        "\n\n\n",
        { "text": "{{nume}}", bold:true},
        { "text": "Tel.: {{mobile}}"},
        { text: "Email: {{contact}}", bold:true},
        
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
}


// playground requires you to assign document definition to a variable called dd

var dd = {
        "pageSize": "A4",
        "pageOrientation": "portrait",
        "pageMargins": [40, 60],

        "content": [
            {
                "columns": [{
                        fit: [100, 68],
                        svg: `<svg version="1.1" viewBox="0 0 584 384" xmlns="http://www.w3.org/2000/svg">
 <defs>
  <clipPath id="clipPath96974">
   <path d="m318.75 316.43 3.597-2.075 3.761 2.171v4.342l-7.358-4.438z"/>
  </clipPath>
  <mask id="mask96992" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96986)"/>
  </mask>
  <linearGradient id="linearGradient96986" x2="1" gradientTransform="matrix(3.761 6.514 6.514 -3.761 321.49 314.85)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
  <mask id="mask96930" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96924)"/>
  </mask>
  <linearGradient id="linearGradient96924" x2="1" gradientTransform="matrix(-3.761 -6.514 -6.514 3.761 339.99 312.85)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
  <mask id="mask96868" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96862)"/>
  </mask>
  <linearGradient id="linearGradient96862" x2="1" gradientTransform="matrix(3.7607 -6.5136 -6.5136 -3.7607 336.23 321.36)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
  <clipPath id="clipPath96788">
   <path d="m322.51 304.76 3.598 2.076v4.343l-3.76 2.171 0.162-8.59z"/>
  </clipPath>
  <mask id="mask96806" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96800)"/>
  </mask>
  <linearGradient id="linearGradient96800" x2="1" gradientTransform="matrix(-3.7605 6.5132 6.5132 3.7605 325.25 306.34)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
  <clipPath id="clipPath96726">
   <path d="m326.98 306.33 7.52-4.152v4.152l-3.761 2.172-3.759-2.172z"/>
  </clipPath>
  <mask id="mask96744" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96738)"/>
  </mask>
  <linearGradient id="linearGradient96738" x2="1" gradientTransform="matrix(-7.5205 0 0 7.5205 334.5 305.34)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
  <clipPath id="clipPath96664">
   <path d="m326.98 321.37 3.759-2.172 3.761 2.172-7.52 4.153v-4.153z"/>
  </clipPath>
  <mask id="mask96682" x="0" y="0" width="1" height="1" maskUnits="userSpaceOnUse">
   <path d="m-32768 32767h65535v-65534h-65535v65534z" fill="url(#linearGradient96676)"/>
  </mask>
  <linearGradient id="linearGradient96676" x2="1" gradientTransform="matrix(7.5205 0 0 -7.5205 326.98 322.36)" gradientUnits="userSpaceOnUse">
   <stop stop-color="#fff" stop-opacity=".15" offset="0"/>
   <stop stop-color="#fff" stop-opacity=".6" offset="1"/>
  </linearGradient>
 </defs>
 <g>
  <path transform="matrix(13.261 0 0 -13.321 290.15 6.5644)" d="m 0,0 0,-8.495 3.761,2.172 0,4.152 L 0,0 Z" fill="#007afb"/>
  <path transform="matrix(13.261 0 0 -13.321 290.15 119.73)" d="m0 0v8.495l-3.76-2.171v-4.152l3.76-2.172z" fill="#0d1e67"/>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" clip-path="url(#clipPath96664)" fill="#fff">
   <g fill="#fff">
    <g fill="#fff" mask="url(#mask96682)">
     <g fill="#fff">
      <path d="m326.98 321.37 3.759-2.172 3.761 2.172-7.52 4.153v-4.153z" fill="#fff"/>
     </g>
    </g>
   </g>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 290.15 375.41)" fill="#007afb">
   <path d="m0 0v8.495l-3.76-2.172v-4.152l3.76-2.171z" fill="#007afb"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 290.15 262.25)" fill="#0d1e67">
   <path d="m 0,0 0,-8.495 3.761,2.171 0,4.152 L 0,0 Z" fill="#0d1e67"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" clip-path="url(#clipPath96726)" fill="#fff">
   <g fill="#fff">
    <g fill="#fff" mask="url(#mask96744)">
     <g fill="#fff">
      <path d="m326.98 306.33 7.52-4.152v4.152l-3.761 2.172-3.759-2.172z" fill="#fff"/>
     </g>
    </g>
   </g>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 131.15 283.19)" fill="#007afb">
   <path d="M 0,0 7.357,4.247 3.598,6.418 0,4.342 0,0 Z" fill="#007afb"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 228.72 226.62)" fill="#0d1e67">
   <path d="m0 0-7.357-4.247 3.76-2.172 3.597 2.076v4.343z" fill="#0d1e67"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" clip-path="url(#clipPath96788)" fill="#fff">
   <g fill="#fff">
    <g fill="#fff" mask="url(#mask96806)">
     <g fill="#fff">
      <path d="m322.51 304.76 3.598 2.076v4.343l-3.76 2.171 0.162-8.59z" fill="#fff"/>
     </g>
    </g>
   </g>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 449.15 98.782)" fill="#007afb">
   <path d="m0 0-7.357-4.247 3.76-2.171 3.597 2.076v4.342z" fill="#007afb"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 351.59 155.36)" fill="#0d1e67">
   <path d="M 0,0 7.357,4.247 3.597,6.419 0,4.343 0,0 Z" fill="#0d1e67"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" fill="#fff" mask="url(#mask96868)">
   <g fill="#fff">
    <path d="m335.37 320.87v-4.342l3.76-2.171-0.163 8.59-3.597-2.077z" fill="#fff"/>
   </g>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 449.15 283.19)" fill="#007afb">
   <path d="m0 0-7.357 4.247v-4.343l3.596-2.076 3.761 2.172z" fill="#007afb"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 351.59 226.62)" fill="#0d1e67">
   <path d="m 0,0 7.357,-4.247 0,4.342 L 3.761,2.171 0,0 Z" fill="#0d1e67"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" fill="#fff">
   <g fill="#fff" mask="url(#mask96930)">
    <g fill="#fff">
     <path d="m335.37 311.17v-4.343l7.358 4.438-3.598 2.076-3.76-2.171z" fill="#fff"/>
    </g>
   </g>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 131.15 98.782)" fill="#007afb">
   <path d="m 0,0 7.357,-4.247 0,4.343 L 3.761,2.172 0,0 Z" fill="#007afb"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 228.72 155.36)" fill="#0d1e67">
   <path d="m0 0-7.357 4.247v-4.342l3.596-2.076 3.761 2.171z" fill="#0d1e67"/>
  </g>
  <g transform="matrix(13.261 0 0 -13.321 -4095.7 4371.6)" clip-path="url(#clipPath96974)" fill="#fff">
   <g fill="#fff">
    <g fill="#fff" mask="url(#mask96992)">
     <g fill="#fff">
      <path d="m318.75 316.43 3.597-2.075 3.761 2.171v4.342l-7.358-4.438z" fill="#fff"/>
     </g>
    </g>
   </g>
  </g>
  <flowRoot fill="black" font-family="sans-serif" font-size="40px" stroke-width="1px" xml:space="preserve"><flowRegion><rect x="86.286" y="7.4286" width="388" height="310.86"/></flowRegion><flowPara/></flowRoot>
 </g>
</svg>
`
                    },
                    {
                        "width": "60%",
                        "text": [
                            { "text": "INVOICE", "style": "header" },
                            "\nInvoice No.: ",
                            { "text": "{{SERIA}}", "fontSize": 13, "bold": true },
                            { "text": "\nDate (day/month/year): {{INVOICE_DATE}}" },
                            { "text": "\nVAT: {{TVA}}%" },
                        ],
                        "alignment": "right"
                    }
                ]
            },
            {
                canvas: [
                    {
                      type: 'line',
                      x1: 280, y1: -47,
        			  x2: 520, y2: -47,
        			  lineWidth: 2,
                    },
                    {
                      type: 'line',
                      x1: 0, y1: 10,
        			  x2: 520, y2: 10,
        			  lineWidth: 3,
                    }
                ]
                    
            },
            "\n",
            {
                "columns": [{
                        "width": "47%",
                        "text": [
                            "Supplier:\n",
                            { "text": "{{nume}}\n", "bold": true },
                            "Nat. Reg. No.: {{NORG}}\n",
                            "VAT Code: {{CUI}}\n",
                            "Address:\n{{adresa}}\n",
                            "IBAN (IBAN): {{IBAN}}\n",
                            "Bank (Banca): {{banca}}\n",
                            "BIC: {{bic}}\n",
                            "Contact: {{contact}}"
                        ]
                    },
                    {
                        "width": "6%",
                        "text": ""
                    },
                    {
                        "width": "47%",
                        "text": [
                            "Customer:\n",
                            { "text": "{{nume}}\n", "bold": true },
                            "Nat. Reg. No.: {{NORG}}\n",
                            "VAT: {{CUI}}\n",
                            "Address:\n{{adresa}}\n",
                            "IBAN: {{IBAN}}\n",
                            "Bank: {{banca}}\n",
                            "BIC: {{bic}}\n",
                            "Contact: {{contact}}"
                            
                        ]
                    }
                ]
            },
            "\n\n",

            {
                "table": {
                    "widths": [15, "*", 25, 55, 55, 55, 55],
                    "body": [
                        [ 
                            {"text":"Nr.", "style":"tableHeader"}, 
                            {"text":"Description of products/services", "style":"tableHeader"}, 
                            {"text":"Unit", "style":"tableHeader"}, 
                            {"text":"Quantity", "style":"tableHeader"},
                            {"text":"Unit price w/o VAT\n-EUR-", "style":"tableHeader"},
                            {"text":"Value\n-EUR-", "style":"tableHeader"},
                            {"text":"VAT\n-EUR-", "style":"tableHeader"}
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
                        [
                            {"text": 1, "alignment":"center"}, 
                            {"text":"{{details}}"},
                            {"text":"{{um}}", "alignment":"center"},
                            {"text":"{{qty}}", "alignment":"center"},
                            {"text":"{{up}}", "alignment":"right"},
                            {"text":"{{line_value}}", "alignment":"right"},
                            {"text":"{{line_tva}}", "alignment":"right"}
                        ],
                        [
                            {"text": "SUBTOTAL", "colSpan":5, "bold":true, "alignment":"right"},
                            '','','','',
                            {"text": "INVOICE_SUM", "bold":true, "alignment":"right"},
                            {"text": "INVOICE_TVA_SUM", "bold":true, "alignment":"right"},
                            
                        ],
                        [
                            {"colSpan":5, "text": "TOTAL VALUE", "bold":true, "fontSize":13, "alignment":"right"},
                            '','','','',
                            {"colSpan":2, "text":"TOTAL_INVOICE" , "bold":true, "fontSize":13, "alignment":"center"},
                            ''
                            
                        ]
                    ]
                }
            },
            "\n",
            { "text": "Payment term (Termen de plata): {{due_term}}"},
            { text: "{{invoice_details}}", bold:true},
                
            "\n\n\n",
            
            {
                "table": {
                    "widths": ["*"],
                    "body": [
                        [{
                            "text": [
                                "Due date: ",
                                { "text": "{{DUE_DATE}}\n", "bold": true },
                                "\nPlease insert the following message in the payment details: ",
                                { "text": "\n{{SERIA}}-{{NUMARUL}}", "bold": true, alignment:"center" }
                            ],
                            "margin": [5, 5, 33, 5],
                            "fontSize": 13
                        }]
                    ]
                }
            },
            "\n\n\n",
            { "text": "{{nume}}", bold:true},
            { "text": "Tel.: {{mobile}}"},
            { text: "Email: {{contact}}", bold:true},
            
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
    }

*/

