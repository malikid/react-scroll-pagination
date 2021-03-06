/**
* 在页面滚动的时候，监听滚动事件，在快要到达底部指定距离的时候，执行相应函数
* 如果传入 totalPages, 则会在鼠标滚动时
*
* <ReactScrollPagination
    fetchFunc = {targetFuc}
    totalPages = {totalPages}
  />
*/

import React, { PropTypes } from 'react'
const jQuery = require('jquery')

const ReactScrollPagination = React.createClass({

  propTypes: {
    fetchFunc: PropTypes.func.isRequired,
    totalPages: PropTypes.number,
    windowElement: PropTypes.string, // The element selector which contains the list container and is responsible for scrolling
    documentElement: PropTypes.string, // The element selector which contains the list
    paginationShowTime: PropTypes.oneOfType([
      PropTypes.number, // How long shall the pagination div shows
      PropTypes.string
    ]),
    excludeTopMargin: PropTypes.oneOfType([
      PropTypes.number, // The height value which should be excluded from scrollTop calculation
      PropTypes.string
    ]),
    excludeElement: PropTypes.string, // The element selector which should be excluded from calculation
    excludeHeight: PropTypes.oneOfType([
      PropTypes.number, // the height value which should be excluded from calculation
      PropTypes.string
    ]),
    outterDivStyle: PropTypes.object, // Style of the outter Div element
    innerDivStyle: PropTypes.object, // Style of the inner Div element
    triggerAt: PropTypes.oneOfType([
      PropTypes.number, // The distance to trigger the fetchfunc
      PropTypes.string
    ]),
  },

  isolate: {
    onePageHeight: null,
    timeoutFuncHandler: null,
    excludeTopMargin: null,
    excludeHeight: null,
    triggerAt: null,
    showTime: null,
    defaultShowTime: 2000,
    defaultTrigger: 30,
    defaultExcludeTopMargin: 0,
    defaultExcludeHeight: 0
  },

  pageDivStle: {
    position: 'fixed',
    bottom: '15px',
    left: 0,
    right: 0,
    textAlign: 'center'
  },

  pageContentStyle: {
    display: 'inline-block',
    background: 'rgba(6, 6, 6, 0.54)',
    borderRadius: '5px',
    padding: '3px 15px',
    minWidth: '80px',
    color: '#fff',
    textAlign: 'center',
    margin: '0 auto',
    opacity: 1,
    WebkitTransition: 'opacity 0.8s',
    MozTransition: 'opacity 0.8s',
    OTransition: 'opacity 0.8s',
    transition: 'opacity 0.8s'
  },

  getInitialState: function () {
    this.windowElement = this.props.windowElement || window
    this.documentElement = this.props.documentElement || document

    return {
      currentPage: 1,
      totalPages: null,
      showPageStatus: false
    }
  },

  showPagePositionDiv: function () {
    if (this.isolate.timeoutFuncHandler) {
      clearTimeout(this.isolate.timeoutFuncHandler)
    }
    this.setState({showPageStatus: true})

    this.isolate.timeoutFuncHandler = setTimeout(() => {
      this.setState({showPageStatus: false})
    }, this.isolate.showTime)
  },

  getShowTime: function () {
    let showTime = this.isolate.defaultShowTime
    if (this.props.paginationShowTime) {
      showTime = parseInt(this.props.paginationShowTime)
      if (isNaN(showTime)) {
        showTime = this.isolate.defaultShowTime
        console.error('WARNING: Failed to convert props "paginationShowTime" to Number with value: "' +
          this.props.paginationShowTime + '". Will take ' + this.isolate.defaultShowTime + ' by default.')
      }
    }
    return showTime
  },

  getExcludeTopMargin: function () {
    // 获取需要减去的高度
    let excludeTopMargin = this.isolate.defaultExcludeTopMargin

    if (this.props.excludeTopMargin) {
      let propsExcludeTopMargin = parseInt(this.props.excludeTopMargin)
      if (isNaN(propsExcludeTopMargin)) {
        console.error('WARNING: Failed to convert the props "excludeTopMargin" with value: "' + this.props.excludeTopMargin +
          '" to Number, please verify. Will take "' + this.isolate.defaultExcludeTopMargin + '" by default.')
      } else {
        excludeTopMargin = propsExcludeTopMargin
      }

    }

    this.isolate.excludeTopMargin = excludeTopMargin

    return excludeTopMargin
  },

  getExcludeHeight: function () {
    // 获取需要减去的高度
    let excludeHeight = this.isolate.defaultExcludeHeight

    if (this.props.excludeHeight) {
      let propsExcludeHeight = parseInt(this.props.excludeHeight)
      if (isNaN(propsExcludeHeight)) {
        console.error('WARNING: Failed to convert the props "excludeHeight" with value: "' + this.props.excludeHeight +
          '" to Number, please verify. Will take "' + this.isolate.defaultExcludeHeight + '" by default.')
      } else {
        excludeHeight = propsExcludeHeight
      }

    } else if (this.props.excludeElement && typeof this.props.excludeElement === 'string') {
      let excludeEle = jQuery(this.props.excludeElement)

      if (excludeEle.size() === 0) {
        console.error('WARNING: Failed to get the element with given selector "' + this.props.excludeElement +
          '", please veirify. Will take "' + this.isolate.defaultExcludeHeight + '" by default.')
      } else {
        excludeHeight = excludeEle.height()
      }
    }
    this.isolate.excludeHeight = excludeHeight

    return excludeHeight
  },

  getTriggerAt: function () {
    let triggerAt = this.isolate.defaultTrigger

    if (this.props.triggerAt) {
      triggerAt = parseInt(this.props.triggerAt)

      if (isNaN(triggerAt)) {
        triggerAt = this.isolate.defaultTrigger

        console.error('WARNING: Failed to convert the props "triggerAt" to number with value: "' +
          this.props.triggerAt + '". Will take 30px by default.')
      }
    }

    return triggerAt
  },

  getOnePageHeight: function () {
    const documentHeight = jQuery(this.documentElement).height()

    /*
    * 当totalPages第一次有值时，表明List是初次加载，此时计算页面的高度，并将其作为单页的高度
    * 如果页面有固定的顶部头，通过 excludeHeight 将其减去
    */
    if (typeof this.props.totalPages === 'number' && this.props.totalPages > 0 && this.isolate.onePageHeight === null) {
      this.isolate.onePageHeight = documentHeight - this.isolate.excludeHeight
    }
  },
  handlePagePosition: function () {
    this.getOnePageHeight()

    let windowHeight = jQuery(this.windowElement).height()
    let scrollTop = jQuery(this.windowElement).scrollTop() + windowHeight - this.isolate.excludeHeight - this.isolate.excludeTopMargin

    if (this.isolate.onePageHeight !== null) {
      let currentPage = Math.ceil(scrollTop / this.isolate.onePageHeight) || 1
      this.setState({currentPage: currentPage})
      this.showPagePositionDiv()
    }
  },

  scrollHandler: function () {
    let documentHeight = jQuery(this.documentElement).height()

    let windowHeight = jQuery(this.windowElement).height()
    let scrollBottom = jQuery(this.windowElement).scrollTop() + windowHeight
    let triggerBottom = scrollBottom + this.isolate.triggerAt

    // 当滚动条距离底部距离小于30像素的时候出发请求操作
    if (triggerBottom >= documentHeight) {
      this.props.fetchFunc()
    }

    this.handlePagePosition()
  },

  validateAndSetPropValues: function () {
    this.isolate.triggerAt = this.getTriggerAt()
    this.isolate.excludeTopMargin = this.getExcludeTopMargin()
    this.isolate.excludeHeight = this.getExcludeHeight()
    this.isolate.showTime = this.getShowTime()
  },

  componentWillUnmount: function () {
    jQuery(this.windowElement).unbind('scroll', this.scrollHandler)
  },

  componentDidMount: function () {
    this.validateAndSetPropValues()
    jQuery(this.windowElement).scroll(this.scrollHandler)
  },

  extend: function () {
    for(var i = 1; i < arguments.length; i++) {
      for(var key in arguments[i]) {
        if(arguments[i].hasOwnProperty(key)) { 
          if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
            extend(arguments[0][key], arguments[i][key])
          } else {
            arguments[0][key] = arguments[i][key]
          }
        }
      }
    }
    return arguments[0]
  },

  render: function () {
    // if no totalPages presented, will only do the fetchings
    if (typeof this.props.totalPages === 'undefined') {
      return (null)
    }

    let acutalPageContentDivStyle = this.extend({}, this.props.innerDivStyle || this.pageContentStyle)

    // always set the opacity for inner div, so they are able to make the transition
    if (!this.state.showPageStatus) {
      acutalPageContentDivStyle.opacity = 0
    }

    return (
      <div style={this.props.outterDivStyle || this.pageDivStle} >
        <div style={acutalPageContentDivStyle} className='react-scroll-pagination-inner-div'>
          <span >
            {this.state.currentPage}
          </span>
          /
          <span >
            {this.props.totalPages || 1}
          </span>
        </div>
      </div>
    )
  }
})

export default ReactScrollPagination
