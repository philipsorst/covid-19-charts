import {BaseType, Selection} from 'd3';

export class Utils
{

    static getBoundingClientRect(selection: Selection<any, any, any, any>): DOMRect
    {
        const node: BaseType = selection.node();
        if (null == node) throw 'Node was empty';

        return (node as Element).getBoundingClientRect();
    }
}
