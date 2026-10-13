import { Component } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private metaService: Meta,
    private titleService: Title
  ) {
    const title = 'IGO FADQ - La Financière agricole du Québec';
    this.titleService.setTitle(title);
    this.metaService.addTag({
      name: 'title',
      content: title
    });
  }

}
