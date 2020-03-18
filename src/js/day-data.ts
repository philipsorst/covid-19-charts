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

    public getGrowthChangeRate(): number | null
    {
        if (this.previous == null) {
            return null;
        }

        const lastGrowth = this.previous.getGrowth();
        if (null == lastGrowth) {
            return null;
        }

        if (0 === lastGrowth) {
            return 0;
        }

        const currentGrowth = this.getGrowth() as number;

        return currentGrowth / lastGrowth;
    }

    public getRolling(accessor: () => (number | null))
    {
        if (null == this.previous || null == this.next) {
            return null;
        }

        const previousValue = accessor.call(this.previous);
        const currentValue = accessor.call(this);
        const nextValue = accessor.call(this.next);

        if (null == previousValue || null == currentValue || null == nextValue) {
            return null;
        }

        return (previousValue + currentValue + nextValue) / 3;
    }

    public getGrowth(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        return this.confirmed - this.previous.confirmed;
    }

    public getGrowthChange(): number | null
    {
        if (null == this.previous) {
            return null;
        }
        const previousGrowth = this.getGrowth();
        const currentGrowth = this.previous.getGrowth();
        if (null == previousGrowth || null == currentGrowth) {
            return null;
        }

        return currentGrowth - previousGrowth;
    }

    public getConfirmed(): number
    {
        return this.confirmed;
    }

    public getRecovered(): number
    {
        return this.recovered;
    }

    public getDeaths(): number
    {
        return this.deaths;
    }
}
