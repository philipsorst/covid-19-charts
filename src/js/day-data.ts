export class DayData
{
    constructor(public date: Date)
    {
    }

    deaths: number = 0;
    recovered: number = 0;
    confirmed: number = 0;
    previous: DayData | null = null;
    next: DayData | null = null;

    public getPending(): number
    {
        return this.confirmed - this.recovered - this.deaths;
    }

    public getDeathRate(): number
    {
        if (this.deaths + this.recovered === 0) {
            return 0;
        }
        return this.deaths / (this.deaths + this.recovered);
    }

    public getConfirmedGrowthRate(): number
    {
        if (null == this.previous) {
            return 0;
        }

        return (this.confirmed - this.previous.confirmed) / this.previous.confirmed;
    }

    public getPendingGrowthRate(): number
    {
        if (null == this.previous) {
            return 0;
        }

        return (this.getPending() - this.previous.getPending()) / this.previous.getPending();
    }
}
