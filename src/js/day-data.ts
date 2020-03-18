export class DayData
{
    constructor(public date: Date)
    {
    }

    deaths: number = 0;
    recovered: number = 0;
    confirmed: number = 0;
    pendingGrowthRate: number = 0;
    confirmedGrowthRate: number = 0;

    public getPending(): number
    {
        return this.confirmed - this.recovered - this.deaths;
    }

    public getDeathRate()
    {
        if (this.deaths + this.recovered === 0) {
            return 0;
        }
        return this.deaths / (this.deaths + this.recovered);
    }
}
