import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  //stocksList = {};
  stocksArray:any[] = [];
  stockIndexList = {};
  stockCharts = {};
  //somestrings:string[] = []; //??
/*
  sortedStocksArray = stocksList.filter;  
  sortStocksArray() {
    
      let storeId = 1;
      this.bookFilteredList = this.bookList
                                  .filter((book: Book) => book.storeId === storeId);
      this.bookList = this.bookFilteredList; 
    }
*/
  ngOnInit() {

      //var stocks = this.stocksList;
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
          //stockChartData['normalisedPrices'] = [];
          stockChartData['min'] = price;
          stockChartData['max'] = price;

          stockCharts[symbol] = stockChartData;
        }

        var rawPrices = stockChartData['rawPrices'];
        rawPrices.push(price);
        //console.log("price="+price);
        if (rawPrices.length > numPricesInChart) rawPrices.shift();

        //if (price > stockChartData['max']) stockChartData['max'] = price;
        //if (price < stockChartData['min']) stockChartData['min'] = price;

        stockChartData['max'] = Math.max.apply(null, rawPrices);
        stockChartData['min'] = Math.min.apply(null, rawPrices);


        //Run through and normalize prices to make them fit into chart height
        //var normalisedPrices = [];
        var min = stockChartData['min'];
        var max = stockChartData['max'];
        var diff = max-min;

        var chartPoints = "";
        var chartx = 0;
        for (var i=0; i<rawPrices.length; i++) {
          //console.log("rawPrices[i]="+rawPrices[i]);
          //console.log("min="+min);
          //console.log("diff="+diff);

          var normalisedPrice = ((rawPrices[i]-min)/diff)*svgChartHeight;
          //normalisedPrices[i] = (rawPrices[i]-min)/diff;
          chartPoints += ""+chartx+","+Math.floor(svgChartHeight-normalisedPrice)+"\n";
          chartx = chartx + (svgChartWidth/numPricesInChart);
        }
        //console.log(chartPoints);
        return chartPoints;
        //stockChartData['normalisedPrices'] = normalisedPrices;
      }


      /*
      let source = new EventSource('https://app.example.com/stocks');
      source.addEventListener('message', message => {
          //this.myData = JSON.parse(message.data); 
          console.log(message.data)       
      });
      */
      
      let source = new EventSource('https://app.example.com/fx');
      source.addEventListener('message', message => {
        //console.log(event.data);

        let stockJson = JSON.parse((message as any).data);  //Sometimes ng serve would compain that data was not an object on this type, so this casts it to "any"
        stockJson.price = parseFloat(stockJson.price).toFixed(stockJson.dp);

        //See if the object is already in the list
        if (stockIndexList[stockJson.sym]!= undefined) {
          var oldPrice = stocksArray[stockIndexList[stockJson.sym]].price;
          //stocks[stockJson.sym] = stockJson;
          stocksArray[stockIndexList[stockJson.sym]] = stockJson;

          //Add chart
          
          //var chart="<svg id='svg"+stockJson.sym+"' width='100' height='40' class='chart'></svg>";
          //chart += "<polyline fill='none' stroke='#0074d9' stroke-width='3' points='"
          //var chart = "0,12\n";
          //chart += "2,6\n";
          //chart += "4,8\n";
          //chart += "6,2\n";
          //chart += "'/>";
          
          stockJson.chart = addPriceToChart(stockJson.sym, stockJson.price); //chart;

          //document.getElementById("chart"+stockJson.sym).innerHTML = chart;
          //console.log(document.getElementById("chart"+stockJson.sym));

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
          //stocks[stockJson.sym] = stockJson;
          //stockIndexList[stockJson.sym] = stocksArray.length;
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
        //stocksArray[0] = stockJson;

      }, false);
      
  }
  title = 'Forex Demo';
}
