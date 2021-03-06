import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { separatorFormat, ellipsisStyleFormat, minWidthStyleFormat, maxWidthStyleFormat } from './format.js';
import { isObject } from 'util';
import { AutoTooltip } from './components';

class List extends Component {

    static propTypes = {
        children: PropTypes.node,
        render: PropTypes.func.isRequired
    }

    render() {
        const { render } = this.props;
        const config  = render();
        const props = this.propsHandler( Object.assign({}, this.props, config) );
        const { columns, dataSource } = config;
        const nextDataSource = dataSource && dataSource.map((dataItem, index) => {
            return Object.assign({}, dataItem, {
                key: index
            })
        })
        const nextColumns = this.columnsHandler(columns);
        return (
            <Table
                columns={nextColumns}
                dataSource={nextDataSource}
                {...props}
            >
            </Table>
        );
    }

    columnsHandler = ( columns ) => {
        return columns && columns.map(item => {
            const { autoTooltip } = item;
            const style = this.styleFormatter(item);
            const orignRender = item.render;
            item.render = (text, record, index) => {
                let value = this.valueFormatter(text, item);
                // dataIndex 不存在时 text === record
                value = isObject(value) ? '' : value;
                if( orignRender && typeof orignRender === 'function' ){
                    value = orignRender(value, record, index);
                }
                return (
                    <div style={style}>
                        {
                            autoTooltip === true
                                ? <AutoTooltip>{value}</AutoTooltip>
                                : <span>{value}</span>
                        }
                        
                    </div>
                )
            }
            return item;
        })
    }

    styleFormatter = (item) => {
        const defaultStyle = {}
        const style = ellipsisStyleFormat(item.ellipsis);
        const minWidthStyle = minWidthStyleFormat(item.minWidth);
        const maxWidthStyle = maxWidthStyleFormat(item.maxWidth);
        return Object.assign(defaultStyle, style, minWidthStyle, maxWidthStyle);
    }

    valueFormatter = (text, item) => {
        text = this.separatorFormatterHandler(text, item);
        return text;
    }

    separatorFormatterHandler = (value, item) => {
        if( item.separator ){
            // 千位符格式化
            value = separatorFormat(value, item.separator);
        }
        return value;
    }

    propsHandler = ( config ) => {
        const nextConfig = Object.assign({}, config);
        this.autoScrollHandler(nextConfig);
        this.defaultPropsHandler(nextConfig);

        delete nextConfig.type;
        delete nextConfig.name;
        delete nextConfig.columns;
        delete nextConfig.dataSource;
        delete nextConfig.page;
        delete nextConfig.render;

        return nextConfig;
    }

    autoScrollHandler = ( config ) => {
        const { columns } = config;
        if( columns && columns.length && !config.scroll){
            let count = 0;
            let countWidth = 0;
            columns.forEach(item => {
                if( item && item.width ){
                    count++;
                    countWidth += parseInt(item.width)
                }
            })
            if( count === columns.length && countWidth ){
                config.scroll = {
                    x: countWidth
                }
            }else{
                config.scroll = {
                    x: true,
                }
                // config.style = {
                //     whiteSpace: 'nowrap'
                // }
            }
        }
    }

    /**
     * 
     */
    defaultPropsHandler = ( config ) => {
        const { page, pagination } = config;
        if( page ){
            config.pagination = {
                size: "small",
                showSizeChanger: true,
                showQuickJumper: true,
                pageSize: config.page.pageSize,
                current: config.page.pageIndex,
                total: config.page.total,
                onChange: config.page.onPageIndexChange,
                onShowSizeChange: config.page.onPageSizeChange,
                showTotal: total => `共 ${total} 条`, 
            }
        }
        if( pagination ){
            config.pagination = pagination;
        }
        if( page === false || pagination === false ){
            config.pagination = false;
        }
        config.size = config.size || 'middle';
        config.bordered = config.bordered || true;
    }
}

export default List;
