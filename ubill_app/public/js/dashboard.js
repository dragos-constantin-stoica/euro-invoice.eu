// register globally (or you can do it locally)
Vue.component("v-chart", VueECharts);


Vue.component("dashboard", {
  data() {
    return {
      loading: true,
      company: null,
      company_list: [{ value: null, text: 'Please select an option' }],
      option_bar:{
        textStyle: {
          fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 300
        },
        dataset: {
          dimensions: ["Product", "2015", "2016", "2017"],
          source: [
            {
              Product: "Matcha Latte",
              2015: 20,
              2016: 20,
              2017: 20
            },
            {
              Product: "Milk Tea",
              2015: 20,
              2016: 20,
              2017: 20
            },
            {
              Product: "Cheese Cocoa",
              2015: 20,
              2016: 20,
              2017: 20
            },
            {
              Product: "Walnut Brownie",
              2015: 20,
              2016: 20,
              2017: 20
            }
          ]
        },
        xAxis: { type: "category" },
        yAxis: {},
        // Declare several bar series, each will be mapped
        // to a column of dataset.source by default.
        series: [{ type: "bar" }, { type: "bar" }, { type: "bar" }]
      },
      option_pie: {
        textStyle: {
          fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
        },
        title: {
          text: 'Traffic Sources',
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
            'Direct',
            'Email',
            'Ad Networks',
            'Video Ads',
            'Search Engines',
          ],
        },
        series: [
          {
            name: 'Traffic Sources',
            type: 'pie',
            radius: '55%',
            center: ['50%', '60%'],
            data: [
              { value: 335, name: 'Direct' },
              { value: 310, name: 'Email' },
              { value: 234, name: 'Ad Networks' },
              { value: 135, name: 'Video Ads' },
              { value: 1548, name: 'Search Engines' },
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
      },

      show: true
    }
  },

  created() {
    axios
      .get('/companies')
      .then(response => {
        console.log(response.data)
        if (response.data.status == 'ok') {
          this.company_list = response.data.dataset.map(item => {
            let tmp = {}
            tmp.value = item
            tmp.text = item.name
            return tmp
          })
          //we select by default the 1st company
          this.company = this.company_list[0].value
          this.loading = false
        }
      })
  },

  template: `

    <div class="d-flex justify-content-center mb-3" v-if="loading">
          <b-spinner type="grow" label="Loading..."></b-spinner>
    </div>
    
    <div v-else>
    <b-card title="Main dashboard" sub-title="Add significant sections">
      <b-card-text>
        <b-form-select id="company" v-model="company" :options="company_list"></b-form-select>
        <b-form-text id="company-help">Select one of the companies from the list.</b-form-text>
      </b-card-text>

      <div style="height:400px">
      <v-chart :option="option_pie" autoresize/>
      </div>
      
      <div style="height:400px">
      <v-chart :option="option_bar" autoresize/>
      </div>

      <b-card-text>
      Invoice situation: due, outstanding
      Top 10 products/services
      Top 10 clients by invoiced
      Top 10 client by payed
      </b-card-text>

      <b-card-text>Graphs with: y2d invoiced vs payed, monthly payed, monthly invoiced, multianual invoiced vs. payed</b-card-text>

      <b-card-text>
      Export to JSON
      Export to Excel
      Export to CSV
      Export for Accounting company --- see with Iulian Suhanea
      Export to PouchDB in browser and replicate to your own CouchDB/PouchDB instance ;)
      </b-card-text>

      <a href="#" class="card-link">Relevant link</a>
      <b-link href="#" class="card-link">Another link</b-link>
    </b-card>
    </div>
	`
});
