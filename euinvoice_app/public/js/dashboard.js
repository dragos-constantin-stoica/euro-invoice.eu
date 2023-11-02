// register globally (or you can do it locally)
Vue.component("v-chart", VueECharts);


Vue.component("dashboard", {
  data() {
    return {
      loading: true,
      company_data: null,
      invoice_data: null,
      company: null,
      company_list: [{ value: null, text: 'Please select an option' }],
      show: true
    }
  },

  computed: {
    getPieData() {
      let option_pie = {
        title: {
          text: 'Y2D Invoices Status',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: [
            'New',
            'Payed',
            'Partially Payed',
            'Overdue'
          ],
        },
        series: [
          {
            name: 'Invoice Status',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 0, name: 'New' },
              { value: 0, name: 'Payed' },
              { value: 0, name: 'Partially Payed' },
              { value: 0, name: 'Overdue' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      }

      let data = [
        { value: 0, name: 'New' },
        { value: 0, name: 'Payed' },
        { value: 0, name: 'Partially Payed' },
        { value: 0, name: 'Overdue' }
      ]
      if (this.invoice_data[this.company._id].length > 0) {
        this.invoice_data[this.company._id].forEach(elm => {
          switch (elm.payload.STATUS) {
            case 'new':
              //Check for overdue
              if (Date.parse(elm.payload.INVOICE_DUE_DATE) <= Date.now()) {
                var idx = data.findIndex(e => e.name == 'Overdue')
                data[idx] = { value: data[idx].value + elm.payload.INVOICE_TOTAL, name: 'Overdue' }
              } else {
                var idx = data.findIndex(e => e.name == 'New')
                data[idx] = { value: data[idx].value + elm.payload.INVOICE_TOTAL, name: 'New' }
              }
              break;
            case 'partially_payed':
              let payed = elm.payload.PAYMENTS.reduce((acc, crtitm) => acc + crtitm.amount, 0)
              //Check for ovedue and compute the rest to be payed
              if (Date.parse(elm.payload.INVOICE_DUE_DATE) <= Date.now()) {
                var idx = data.findIndex(e => e.name == 'Overdue')
                data[idx] = { value: data[idx].value + elm.payload.INVOICE_TOTAL - payed, name: 'Overdue' }
              } else {
                //the rest should be added to New
                var idx = data.findIndex(e => e.name == 'New')
                data[idx] = { value: data[idx].value + elm.payload.INVOICE_TOTAL - payed, name: 'New' }
              }
              var idx = data.findIndex(e => e.name == 'Partially Payed')
              data[idx] = { value: data[idx].value + payed, name: 'Partially Payed' }
              break;
            case 'payed':
              var idx = data.findIndex(e => e.name == 'Payed')
              data[idx] = { value: data[idx].value + elm.payload.INVOICE_TOTAL, name: 'Payed' }
              break;

            default:
              console.log(`Unknown ${elm.STATUS}`);
              break;
          }
        })
      }
      option_pie.series[0].data = data
      return option_pie
    },
    getLineY2DData() {
      let option_line_y2d = {
        title: {
          text: 'Y2D Invoiced vs. Payed'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['Invoiced', 'Payed']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'Invoiced',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            name: 'Payed',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      }
      let series = [
        {
          name: 'Invoiced',
          type: 'line',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          name: 'Payed',
          type: 'line',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
      if (this.invoice_data[this.company._id].length > 0) {
        const crtYear = (new Date()).getFullYear()
        this.invoice_data[this.company._id].forEach(elm => {
          if ((new Date(Date.parse(elm.payload.INVOICE_DATE))).getFullYear() == crtYear) {
            var mth = 0
            if (elm.payload.STATUS == 'payed') {
              //fully payed

              var idx = series.findIndex(e => e.name == 'Payed'),
                payed = elm.payload.PAYMENTS.reduce((acc, crtitm) => acc + crtitm.amount, 0)
              elm.payload.PAYMENTS.forEach(elm => {
                if ((new Date(Date.parse(elm.date))).getFullYear() == crtYear) {
                  mth = Math.max(mth, (new Date(Date.parse(elm.date))).getMonth())
                }
              })
              series[idx].data[mth] += payed
            }
            //new or partially payed or payed - it was invoiced once
            mth = (new Date(Date.parse(elm.payload.INVOICE_DATE))).getMonth()
            var idx = series.findIndex(e => e.name == 'Invoiced')
            series[idx].data[mth] += elm.payload.INVOICE_TOTAL

          }
        })
      }
      option_line_y2d.series = series

      return option_line_y2d
    },
    getLineAllData() {
      let option_line_all = {
        title: {
          text: 'Payments 2020-2023'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['2020', '2021', '2022', '2023']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '2020',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            name: '2021',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            name: '2022',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            name: '2023',
            type: 'line',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      }
      let series = [], legend = { data: [] }, title = { text: 'Payments' }

      if (this.invoice_data[this.company._id].length > 0) {
        this.invoice_data[this.company._id].forEach(elm => {
          if (elm.payload.PAYMENTS.length > 0) {
            //only fully payed invoices
            let payed = 0, lastDate = 0
            elm.payload.PAYMENTS.forEach(elm => {
              payed += elm.amount
              lastDate = (new Date(Date.parse(elm.date))).getTime()
              //set the value for corresponding year and month
              const year = (new Date(lastDate)).getFullYear().toString(), month = (new Date(lastDate)).getMonth()
              if (legend.data.indexOf(year) == -1) {
                legend.data.push(year)
                series.push({ name: year, type: 'line', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
              }
              const idx = series.findIndex(e => e.name == year)
              series[idx].data[month] += payed
            })

          }
        })
        //sort legend
        legend.data.sort()
        //sort series
        series.sort((a, b) => {
          if (a.name.toUpperCase() < b.name.toUpperCase()) return -1
          if (a.name.toUpperCase() > b.name.toUpperCase()) return -1
          return 0
        })

        //create title
        title.text = (legend.data.length > 1) ? `Payments ${legend.data[0]} - ${legend.data[legend.data.length - 1]}` : `Payments ${legend.data[0]}`
      }

      option_line_all.title = title
      option_line_all.legend = legend
      option_line_all.series = series
      return option_line_all
    }
  },

  created() {
    //Get companies and the invoice data
    const dataURLs = ['/companies', '/invoices']

    const getData = async () => {
      try {
        const [companies, invoices] = await Promise.all(dataURLs.map(url => axios.get(url).then(res => res.data)))
        if (companies.status == 'ok' && invoices.status == 'ok') {
          this.company_data = companies.dataset
          this.invoice_data = invoices.dataset

          this.company_list = this.company_data.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value

          //Compute the data for each graph
          this.loading = false
        } else {
          showToast(companies.status == 'ok' ? companies.message : companies.error, 'Message from Server', companies.status == 'ok' ? 'success' : 'error')
          showToast(invoices.status == 'ok' ? invoices.message : invoices.error, 'Message from Server', invoices.status == 'ok' ? 'success' : 'error')
        }
      } catch (error) {
        console.log(error);
      }
    }
    getData()
  },

  template: `

    <div class="d-flex text-center justify-content-center m-3" v-if="loading">
        <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Your dashboard">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>
      
      <b-card-text style="height:400px">
      <v-chart :option="getPieData" autoresize/>
      </b-card-text>

      <b-card-text style="height:400px">
      <v-chart :option="getLineY2DData" autoresize/>
      </b-card-text>

      <b-card-text style="height:400px">
      <v-chart :option="getLineAllData" autoresize/>
      </b-card-text>

    </b-card>
    </div>
	`
});
