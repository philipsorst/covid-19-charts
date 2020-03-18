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

    public getDeathRateRolling(): number
    {

        if (this.next == null || this.previous == null) {
            throw 'next or prev was null';
        }

        return (this.previous.getDeathRate() + this.getDeathRate() + this.next.getDeathRate()) / 3;
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

    public getConfirmedRolling(): number
    {
        if (this.next == null || this.previous == null) {
            throw 'next or prev was null';
        }

        return (this.previous.confirmed + this.confirmed + this.next.confirmed) / 3;
    }

    public getPendingRolling(): number
    {
        if (this.next == null || this.previous == null) {
            throw 'next or prev was null';
        }

        return (this.previous.getPending() + this.getPending() + this.next.getPending()) / 3;
    }

    public getRecoveredRolling(): number
    {
        if (this.next == null || this.previous == null) {
            throw 'next or prev was null';
        }

        return (this.previous.recovered + this.recovered + this.next.recovered) / 3;
    }

    public getDeathsRolling(): number
    {
        if (this.next == null || this.previous == null) {
            throw 'next or prev was null';
        }

        return (this.previous.deaths + this.deaths + this.next.deaths) / 3;
    }

    public getGrowthChange(): number | null
    {
        if (this.previous == null || this.previous.previous == null) {
            return null;
        }

        const lastGrowth = this.previous.confirmed - this.previous.previous.confirmed;
        if (0 === lastGrowth) {
            return null;
        }

        const currentGrowth = this.confirmed - this.previous.confirmed;

        return currentGrowth / lastGrowth;
    }

    public getGrowthChangeRolling(): number | null
    {
        if (
            this.next == null
            || this.previous == null
            || this.previous.previous == null
            || this.previous.previous.previous == null
        ) {
            return null;
        }

        const lastGrowth = this.previous.getConfirmedRolling() - this.previous.previous.getConfirmedRolling();
        if (0 === lastGrowth) {
            return null;
        }

        const currentGrowth = this.getConfirmedRolling() - this.previous.getConfirmedRolling();

        return currentGrowth / lastGrowth;
    }
}
