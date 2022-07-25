import * as React from 'react';
export interface ChangeEvent {
    start?: number;
    end?: number;
}
export interface Props {
    items: any[];
    className?: string;
    scrollbarWidth?: number;
    scrollbarHeight?: number;
    childWidth?: number;
    childHeight?: number;
    onUpdate?(items: any[]): any;
    onChange?(event: ChangeEvent): any;
    onStart?(event: ChangeEvent): any;
    onEnd?(event: ChangeEvent): any;
    renderItem(item: any): any;
}
export interface State {
    topPadding?: number;
    scrollHeight?: number;
    items?: any;
}
export declare class VirtualScroll extends React.Component<Props, State> {
    previousStart: number;
    previousEnd: number;
    startupLoop: boolean;
    private el;
    private content;
    private onScrollListener;
    constructor(props: any);
    componentDidMount(): void;
    componentWillReceiveProps(props: any): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    refresh(): void;
    scrollInto(item: any): void;
    private countItemsPerRow;
    private calculateDimensions;
    private calculateItems;
}
