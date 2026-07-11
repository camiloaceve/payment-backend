export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number,
  ) {}

  public hasSufficientStock(quantity: number = 1): boolean {
    return this.stock >= quantity;
  }

  public decreaseStock(quantity: number = 1): void {
    if (!this.hasSufficientStock(quantity)) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
  }
}
