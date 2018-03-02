import { autoinject, bindable, customElement, inject} from 'aurelia-framework';   
import { Chart } from 'chart.js';

@customElement("status-card")
@autoinject()
export class StatusCard {
    @bindable node: any;
    public vms_count: number = 0;

    constructor(private element: Element){ }

    attached() {
        let virtual_machines = this.node.vms;
        for (let vm in virtual_machines) {
            this.vms_count += 1;
        }

        //plugin for chart.js modified from example taken from: 
        //https://stackoverflow.com/questions/20966817/how-to-add-text-inside-the-doughnut-chart-using-chart-js 
        Chart.pluginService.register({
            beforeDraw: function (chart) {
                if (chart.config.options.elements.center) {
                    //Get ctx from string
                    let ctx = chart.chart.ctx;
                    
                    //Get options from the center object in options
                    let centerConfig = chart.config.options.elements.center;
                    let fontStyle = centerConfig.fontStyle || 'Arial';
                    let txt = centerConfig.text;
                    let color = centerConfig.color || '#000';
                    let sidePadding = centerConfig.sidePadding || 20;
                    let sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
                    
                    //Start with a base font of 30px
                    ctx.font = "30px " + fontStyle;
                    
                    let numLines = txt.length;
                    let centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                    let offsetY = (chart.innerRadius * 2) / (numLines + 1);
                    let innerTop = ((chart.chartArea.top + chart.chartArea.bottom) / 2) - chart.innerRadius;
                    
                    for (let i = 1; i <= numLines; i++) {
                        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                        var stringWidth = ctx.measureText(txt[i - 1]).width;
                    
                        let currentOffsetY = offsetY * i;          
                        let distanceFromCenter = Math.abs(chart.innerRadius - currentOffsetY);
                        
                        let widthAtOffset = Math.sqrt(Math.pow(chart.innerRadius, 2) + Math.pow(distanceFromCenter, 2)) * 2;
                        let elementWidth = widthAtOffset - sidePaddingCalculated;
                            
                        // Find out how much the font can grow in width.
                        var widthRatio = elementWidth / stringWidth;
                        var newFontSize = Math.floor(30 * widthRatio);
                        var elementHeight = offsetY;
                
                        // Pick a new font size so it will not be larger than the height of label.
                        var fontSizeToUse = Math.min(newFontSize, elementHeight);
                
                        //Set font settings to draw it correctly.
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2) - (chart.innerRadius / 2);
                        var centerY_2 = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                        ctx.font = fontSizeToUse + "px " + fontStyle;
                        ctx.fillStyle = color;
                
                        //Draw text in center
                        ctx.fillText(txt[i - 1], centerX, innerTop + currentOffsetY);
                    }
                }
            }
        });

        const memory_percentage = this.node.sdc_id === 'n/a' ? 'n/a' : Math.round(((this.node.memory_total_bytes - (this.node.memory_total_bytes * this.node.reservation_ratio) - this.node.memory_provisionable_bytes) / this.node.memory_total_bytes) * 100) + '%';
        const disk_percentage = this.node.sdc_id === 'n/a' ? 'n/a' : Math.round((this.node.disk_pool_alloc_bytes / this.node.disk_pool_size_bytes) * 100) + '%';

          // memory usage chart
          let memChartCanvas = this.element.getElementsByClassName("memChart");
          let memChart = new Chart(memChartCanvas[0], {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        (this.node.memory_total_bytes - (this.node.memory_total_bytes * this.node.reservation_ratio) - this.node.memory_provisionable_bytes),
                        (this.node.memory_total_bytes * this.node.reservation_ratio) + this.node.memory_provisionable_bytes
                    ],
                    backgroundColor: [
                        "#4285C3", //color for used mem (Red: #EC7676, Light Blue: #4285C3)
                        "#c7d8e8" //color for total mem - used mem (Green: #00D295, Blue: #c7d8e8)
                    ]
                }],
                labels: ["in use", "free"]
            },
            options: {
                elements: {
                    center: {
                        text: ['Mem', memory_percentage],
                        color: '#95989A', //Default black
                        fontStyle: 'Helvetica', //Default Arial
                        sidePadding: 60 //Default 20 (as a percentage)
                    }
                },
                cutoutPercentage: 80,
                legend: {
                    display: false //hide the labels (tooltips still show up)
                },
                title: {
                    display: false,
                    text: this.getChartTitle(this.node.memory_total_bytes),
                    fontSize: 15,
                    position: 'bottom'
                }
              }
          });


          // disk usage chart
          let diskChartCanvas = this.element.getElementsByClassName("diskChart");
          let diskChart = new Chart(diskChartCanvas[0], {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        this.node.disk_pool_alloc_bytes, 
                        (this.node.disk_pool_size_bytes - this.node.disk_pool_alloc_bytes)
                    ],
                    backgroundColor: [
                        "#4285C3", //color for used disk
                        "#c7d8e8" //color for total disk - used disk
                    ]
                }],
                labels: ["in use", "free"]
            },
            options: {
                elements: {
                    center: {
                        text: ['Disk', disk_percentage],
                        color: '#95989A', //Default black (Grey: #95989A)
                        fontStyle: 'Helvetica', //Default Arial
                        sidePadding: 60 //Default 20 (as a percentage)
                    }
                },
                cutoutPercentage: 80,
                legend: {
                    display: false //hide the labels (tooltips still show up)
                },
                title: {
                    display: false,
                    text: this.getChartTitle(this.node.disk_pool_size_bytes),
                    fontSize: 15,
                    position: 'bottom'
                }
              }
          });
    }

    getChartTitle(total_bytes: number): string {
        if (total_bytes >= 1000000000000) 
            return Math.round((total_bytes / 1000000000000) * 100) / 100 + ' TB';
        if (total_bytes >= 1000000000)
            return Math.round((total_bytes / 1000000000) * 100) / 100 + ' GB';
        if (total_bytes >= 1000000)
            return Math.round((total_bytes / 1000000) * 100) / 100 + ' MB';

        return total_bytes + ' bytes';
    }
}