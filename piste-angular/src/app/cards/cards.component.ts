import { Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent {
  topRowCards: string[] = new Array(10).fill("../assets/op_card_back.jpg");
  bottomRowCards: string[] = new Array(10).fill("../assets/op_card_back.jpg");

  pressed = "";

  onCardPress(event: MouseEvent, cardId: string) {
      event.stopPropagation();
      this.pressed = cardId;
  }

  @HostListener('document:mousedown')
  onDocumentMouseDown() {
      this.pressed = "";
  }
}
