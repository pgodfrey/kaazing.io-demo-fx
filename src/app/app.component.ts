import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  stocksArray:any[] = [];
  stockIndexList = {};
  stockCharts = {};

  ngOnInit() {

      var stocksArray = this.stocksArray;
      var stockIndexList = this.stockIndexList;
      var stockCharts = this.stockCharts;

      var svgChartHeight = 180;
      var svgChartWidth = 280;
      var numPricesInChart = 100;

      function addPriceToChart(symbol, price) {
        var stockChartData = stockCharts[symbol];

        if (stockChartData === undefined) {
          stockChartData = {};
          stockChartData['rawPrices'] = [];
          stockChartData['min'] = price;
          stockChartData['max'] = price;

          stockCharts[symbol] = stockChartData;
        }

        var rawPrices = stockChartData['rawPrices'];
        rawPrices.push(price);
        if (rawPrices.length > numPricesInChart) rawPrices.shift();

        stockChartData['max'] = Math.max.apply(null, rawPrices);
        stockChartData['min'] = Math.min.apply(null, rawPrices);


        //Run through and normalize prices to make them fit into chart height
        var min = stockChartData['min'];
        var max = stockChartData['max'];
        var diff = max-min;

        var chartPoints = "";
        var chartx = 0;
        for (var i=0; i<rawPrices.length; i++) {
          var normalisedPrice = ((rawPrices[i]-min)/diff)*svgChartHeight;
          chartPoints += ""+chartx+","+Math.floor(svgChartHeight-normalisedPrice)+"\n";
          chartx = chartx + (svgChartWidth/numPricesInChart);
        }
        return chartPoints;
      }
      
      let source = new EventSource('https://app.example.com/fx');
      source.addEventListener('message', message => {

        let stockJson = JSON.parse((message as any).data);  //Sometimes ng serve would compain that data was not an object on this type, so this casts it to "any"
        stockJson.price = parseFloat(stockJson.price).toFixed(stockJson.dp);

        //See if the object is already in the list
        if (stockIndexList[stockJson.sym]!= undefined) {
          var oldPrice = stocksArray[stockIndexList[stockJson.sym]].price;
          stocksArray[stockIndexList[stockJson.sym]] = stockJson;
          stockJson.chart = addPriceToChart(stockJson.sym, stockJson.price); //chart;

          //See if new price is higher or lower
          if (oldPrice > stockJson.price) {
            stockJson.isHigher = false;
          }
          else {
            stockJson.isHigher = true;
          }
        }
        else {
          //Add it
          stocksArray.push(stockJson);

          //Sort the array
          stocksArray.sort((a: any, b: any) => {
            if (a.sym < b.sym) {
              return -1;
            } else if (a.sym > b.sym) {
              return 1;
            } else {
              return 0;
            }
          });

          //Calculate the stockIndexList (used for updating elements)
          for (var i=0; i<stocksArray.length; i++) {
            var data = stocksArray[i];
            stockIndexList[data.sym] = i;
          }
        }
      }, false);
  }
  title = 'Forex Demo';
}
