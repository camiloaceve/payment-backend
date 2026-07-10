export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number,
  ) {}

  public hasSufficientStock(): boolean {
    return this.stock > 0;
  }

  public decreaseStock(): void {
    if (!this.hasSufficientStock()) {
      throw new Error('Insufficient stock');
    }
    this.stock -= 1;
  }
}
