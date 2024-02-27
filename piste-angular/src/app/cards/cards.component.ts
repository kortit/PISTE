import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit{


  cards: string[] = ["../assets/733462.jpg", "../assets/733439.jpg", "../assets/733464.jpg", "../assets/750509.jpg", "../assets/749436.jpg",
  "../assets/722805.jpg","../assets/732296.jpg","../assets/746393.jpg","../assets/732291.jpg","../assets/747207.jpg"].concat(new Array(10).fill("../assets/op_card_back.jpg"));
  splitAtIndex = 10; // number of cards in the top row
  topRowCards: string[] = new Array(10).fill("../assets/op_card_back.jpg");
  winnerPool: string[] = [];
  bottomRowCards: string[] = new Array(10).fill("../assets/op_card_back.jpg");
  winner = "";

  pressed = "";

  ngOnInit(): void {
    this.updateSplitIndex(this.splitAtIndex);
  }
  
  onCardPress(event: MouseEvent, cardId: string) {
      event.stopPropagation();
      this.pressed = cardId;
  }

  @HostListener('document:mousedown')
  onDocumentMouseDown() {
      this.pressed = "-1";
  }

  updateSplitIndex(newIndex: number) {
      newIndex = Math.min(Math.max(0, newIndex), this.cards.length);
      this.splitAtIndex = newIndex;
      this.topRowCards = this.cards.slice(0, Math.min(this.splitAtIndex, 10));
      this.winnerPool = this.cards.slice(Math.min(this.splitAtIndex, 10), Math.max(this.splitAtIndex, 10));
      this.bottomRowCards = this.cards.slice(Math.max(this.splitAtIndex, 10));
      this.winner = "";
      if(this.splitAtIndex<10){
        this.winner = "David";
      }
      if(this.splitAtIndex>10){
        this.winner = "Benjam";
      }
  }

  incrementSplitIndex() {
      this.updateSplitIndex(this.splitAtIndex + 1);
  }
  decrementSplitIndex() { 
      this.updateSplitIndex(this.splitAtIndex - 1);
  }


}
