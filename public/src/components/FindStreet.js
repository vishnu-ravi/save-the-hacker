import React, {Component} from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import curryRight from 'lodash.curryright';
import * as actions from '../actions';
import conf from '../conf';
import Header from './Header';
import {
    Map,
    KmlLayer,
    DataLayer,
    Feature,
    InfoWindow,
    CustomOverlay,
    Marker,
    MapControl,
    SearchBox
} from 'google-react-maps';
import ReactStreetview from '../libraries/streetView';

import {defineMessages, FormattedMessage, FormattedDate, injectIntl, intlShape} from 'react-intl';
require('../../assets/style/main.less')

class Maps extends Component {
    constructor() {
        super();
        this.time = '';
    }
    componentWillMount() {}
    componentDidMount() {
        this
            .props
            .getStreetViewPlace(this.props.params.id);
            console.log(this.props.streetData);

    }
    componentWillReceiveProps(nexProps) {


    }
    checkPlaceisRight() {
        console.log(this.props.streetData);
        var id = 0;
        this.props.streetData.porno.map((val) => {
            if(val.id == this.props.streetData.pano) {
                var headings = {min: val.heading.min, max: val.heading.max, current: this.props.streetData.heading};
                for(var i in headings)
                {
                    //"Clean" values in order to have the range [-180, 180]
                    if(headings[i] < -180)
                        headings[i] += 360;
                    else if(headings[i] > 180)
                        headings[i] -= 360;
                }

                var heading_wideness_max = 15,
                heading_wideness = Math.abs(headings.max - headings.min);

                if (heading_wideness < heading_wideness_max)
                {
                    headings.min -= (heading_wideness_max - heading_wideness) * .5;
                    headings.max += (heading_wideness_max - heading_wideness) * .5;
                }
                console.log('1 Passed')
                if(headings.min <= headings.current && headings.max >= headings.current) {
                    console.log('2 Passed')
                    if(val.pitch.min <= this.props.streetData.pitch && val.pitch.max >= this.props.streetData.pitch) {
                        console.log('3 Passed');
                        id = 1;
                        return this.props.makeWin();
                    }
                }
            }
        });
        if(id == 0) {
            return this.props.makeLoss();
        }

    }
    render() {
        const {formatMessage} = this.props.intl;
        const googleMapsApiKey = 'AIzaSyChUn8dD8m6b6S1s0owgwMe_wpBligP7mA';
        console.log(this.props.streetData);
        const streetViewPanoramaOptions = this.props.streetData.data;
        return (
            <div className="page mapPage streetView">
                <div className="map">
                    <div>
                        <ReactStreetview
                            onPanoChanged={position => {
                                this.props.loadPano(position)
                        }}
                            onPositionChanged={position => {
                                this.props.loadPosition(position)
                        }}
                            onLocationChanged={data => console.log(data)}
                            apiKey={googleMapsApiKey}
                            streetViewPanoramaOptions={streetViewPanoramaOptions}
                            onPovChanged={pov => this.props.loadPov(pov)}/>
                    </div>
                    <div>
                        {this.props.streetData.title}
                        <span onClick={
                                    () => {
                                        this.checkPlaceisRight();
                                    }
                        }> Click Here</span>
                    </div>
                    {(this.props.streetData.win) ? <div>You won</div>
                        : ((this.props.streetData.load) ? <div>Try Again</div> : <div></div>)}
                </div>
                <Header />
            </div>
        );
    }
}
Maps.propTypes = {
    intl: intlShape.isRequired
};
const injectIntlDecorator = curryRight(injectIntl);
function mapStateToProps(state, ownProps) {
    return {
        streetData: state
            .getIn(['findstreet'])
            .toJS()
    }
}
//This all fuzzz is because we need injecting react-intl export default export
export default compose(injectIntlDecorator(), connect(mapStateToProps, actions, null, {pure: false}))(Maps);
