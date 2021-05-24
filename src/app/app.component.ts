import { Component } from '@angular/core';
import {UpdateService} from './update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  constructor(private updateService: UpdateService) {}
}
