/**
 * @overview 文件描述
 * @author heykk
 */

import React from 'react'
import {View, TouchableOpacity, StyleSheet, Text,Image} from 'react-native'
import PropTypes from 'prop-types'
import {MainBuleColor} from '../../config/DefaultTheme'
import {TreeSelectorModel} from "../..//config/Enums";

export default class RadioCell extends React.Component {
    static propTypes = {
        onCellPress: PropTypes.func,
        onNextPress: PropTypes.func,
        onRadioPress: PropTypes.func,
        text: PropTypes.string.isRequired,
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        data: PropTypes.object,
        selected: PropTypes.bool,
        showRadio: PropTypes.bool,
        showArrow: PropTypes.bool,
        textStyle: PropTypes.object,
        model:PropTypes.string,

    };
    static defaultProps = {
        onCellPress: () => null,
        readOnly: false,
        value: "",
        model: TreeSelectorModel.singleSelectToEnd,
        textStyle: {}
    };

    constructor(props) {
        super(props)
        this.state = {}
    }

    get selectTintColor(){
        return MainBuleColor
    }

    get tintColor(){
        return '#ccc'
    }

    render() {

        return (
            <View style={[style.box, this.props.style]}>
                {this.props.showRadio && <TouchableOpacity activeOpacity={1}
                                                           onPress={() => {
                                                               this.props.onRadioPress(this.props.data)
                                                           }}
                                                           style={{
                                                               paddingLeft: 5,
                                                               paddingVertical: 15
                                                           }}>
                     <Image style={{width:25,height:25,tintColor: this.props.selected ?this.selectTintColor:this.tintColor}}
                                                    source={this.props.selected ?require('../../assets/checkbox-blank-circle.png'):require("../../assets/checkbox-blank-circle-outline.png")}/>
                </TouchableOpacity>}
                <TouchableOpacity activeOpacity={1}
                                  style={{
                                      flex: 1,
                                      justifyContent: 'center',
                                      paddingVertical: 15,
                                      paddingLeft: 15
                                  }}
                                  onPress={() => {
                                      this.props.onCellPress(this.props.data)
                                  }}>
                    <Text style={[{color: '#333',fontSize:14}, this.props.textStyle]}>{this.props.text}</Text>
                </TouchableOpacity>

                <View style={{flexDirection: 'row'}}>
                    {this.props.showArrow && <TouchableOpacity activeOpacity={1}
                                                               onPress={() => {
                                                                   if (this.props.model == TreeSelectorModel.singleSelectAny ||
                                                                       this.props.model == TreeSelectorModel.multiSelectAny ) {
                                                                       this.props.onNextPress(this.props.data)
                                                                   }
                                                                   else {
                                                                       this.props.onCellPress(this.props.data)
                                                                   }
                                                               }}
                                                               style={{
                                                                   paddingLeft: 5,
                                                                   paddingVertical: 15
                                                               }}>

                        <View style={{flexDirection: "row", alignItems: 'center', justifyContent: 'center'}}>
                            {(this.props.model == TreeSelectorModel.singleSelectAny || this.props.model == TreeSelectorModel.multiSelectAny ) && <View style={{
                                height: 15,
                                width: 1.5,
                                backgroundColor: this.tintColor,
                                marginRight:8
                            }}/>}
                            <Image  style={{tintColor:this.tintColor,width:8,height:13,marginTop: 2,marginRight:12}} source={require('../../assets/chevron-right.png')}/>
                        </View>
                    </TouchableOpacity>}
                </View>
            </View>
        );
    }
}

const style = StyleSheet.create({
    box: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#999',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
