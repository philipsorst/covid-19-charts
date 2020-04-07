import * as d3 from 'd3';

export class Utils
{
    static getBoundingClientRect(selection: d3.Selection<any, any, any, any>): DOMRect
    {
        const node: d3.BaseType = selection.node();
        if (null == node) throw 'Node was empty';

        return (node as Element).getBoundingClientRect();
    }

    static colorWithOpacity(hex: string, opacity: number): string
    {
        let color: d3.RGBColor = d3.color(hex) as d3.RGBColor;
        color.opacity = opacity;

        return color.toString();
    }
}
