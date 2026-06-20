import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dachboard-card',
  imports: [],
  templateUrl: './dachboard-card.html',
  styleUrl: './dachboard-card.scss',
})
export class DachboardCard {
 stats=input.required()
}
