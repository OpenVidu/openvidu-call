import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ov-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent implements OnInit {
  @Input() color: string = '#000000';
  constructor() {}

  ngOnInit(): void {
    // setInterval(()=> {
    //   this.getRandomColor();

    // }, 2000);
  }

  changeFontColor() {
    this.getRandomColor();
    console.log(this.color);
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
