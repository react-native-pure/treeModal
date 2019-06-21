/**
 * Created by yzw on 2018/5/3.
 * 拍摄视频
 */
import React from 'react'
import {
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView
} from 'react-native'
import {RNCamera} from '@ibuild-community/react-native-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedCircleProgress from './basic/AnimatedCircleProgress';
import PageModal from "./pageModal/PageModal";
import {ImagePickerMediaEnum,TransitionType} from "../config/Enums";
import {ImagePickerResult} from '../config/Types'

export type CameraProps = {
    type: $Values<typeof ImagePickerMediaEnum>,
    onRequestClose: (ImagePickerResult) => void,
    onError?: (err: Object) => void,
} & ModalProps

export default class CameraModal extends React.PureComponent<CameraProps> {

    static defaultProps = {
        type: ImagePickerMediaEnum.any,
        visible: false,
        onError: () => null
    }

    constructor(props) {
        super(props);
        this.isRecording = false
        this.progressPerMS = 1.0 / (20 * 1000)
        this.duration = 1000.0 / 30;
        this._onPressOut = () => {
            if (this.isRecording && this.videoEnable) {
                this.stopRecordingVideo()
            }
        }
        this._onPress = () => {
            if (this.photoEnable) {
                this.takePicture()
            }
        }
        this._onLonePress = () => {
            if (!this.isRecording && this.videoEnable) {
                this.startRecordingVideo()
            }
        }

        this.close = () => {
            this.setState({
                progress: 0
            })
            this.props.onRequestClose()
        }

        this.switchCamera = () => {
            let cameraType = this.state.cameraType;
            let cameraTypeText = "";
            if (cameraType === RNCamera.Constants.Type.back) {
                cameraType = RNCamera.Constants.Type.front;
                cameraTypeText = "前";
            } else {
                cameraType = RNCamera.Constants.Type.back;
                cameraTypeText = "后";
            }
            this.setState({
                cameraType: cameraType
            });
        }
        this.switchFlash = () => {
            let newFlashMode;
            let flashModeText = "";
            const {auto, on, off} = RNCamera.Constants.FlashMode;
            if (this.state.flashMode === auto) {
                newFlashMode = on;
                flashModeText = "开";
            } else if (this.state.flashMode === on) {
                newFlashMode = off;
                flashModeText = "关";
            } else if (this.state.flashMode === off) {
                newFlashMode = auto;
                flashModeText = "自动";
            }
            this.setState({
                flashMode: newFlashMode,
            });
        }
        this.onShown = () => {
            this.props.onShow && this.props.onShow()
            this.setState({
                showCamera: true
            })
        }

        this.onHidden = () => {
            this.props.onHidden && this.props.onHidden()
            this.setState({
                showCamera: false
            })
        }

        this.state = {
            cameraType: RNCamera.Constants.Type.back,
            flashMode: RNCamera.Constants.FlashMode.auto,
            progress: 0,
            showCamera: false
        }
    }

    get videoEnable() {
        return this.props.type !== ImagePickerMediaEnum.photo
    }

    get photoEnable() {
        return this.props.type !== ImagePickerMediaEnum.video
    }

    get flashIcon() {
        let icon;
        const {auto, on, off} = RNCamera.Constants.FlashMode;
        if (this.state.flashMode === auto) {
            icon = "flash-auto";
        } else if (this.state.flashMode === on) {
            icon = "flash";
        } else if (this.state.flashMode === off) {
            icon = "flash-off";
        }
        return icon;
    }


    //拍摄照片
    async takePicture() {
        //TODO:fixOrientation:true
        const options = {quality: 1, base64: false, forceUpOrientation: true, fixOrientation: true};
        const data = await this.camera.takePictureAsync(options);
        this.props.onRequestClose({
            path: data.uri,
            filename: data.uri.split("/").pop(),
            mime: "image/" + (data.uri.split("/").pop()).split(".").pop(),
            height: data.height,
            width: data.width,
        })
    }


    startProgressTimer(startTime) {
        const diff = Date.now() - startTime;
        startTime = Date.now();
        const progress = diff * this.progressPerMS;
        if (this.isRecording && this.state.progress < 1.0) {
            this.updateState({
                progress: {$set: this.state.progress + progress}
            }, () => {
                setTimeout(this.startProgressTimer.bind(this, startTime), this.duration);
            })
        }
    }

    //开始拍摄视频
    startRecordingVideo() {
        if (!this.isRecording) {
            console.log("开始录像...")
            this.isRecording = true
            this.setState({
                progress: 0
            }, () => {
                this.startProgressTimer(Date.now())
                let option = {
                    maxDuration: 20,
                    //质量设置为480P,否则android会发生crash
                    quality: RNCamera.Constants.VideoQuality['480p']
                }
                if (Platform.OS === "ios") {
                    option.codec = RNCamera.Constants.VideoCodec.H264
                }

                this.camera.recordAsync(option).then((data) => {
                    this.isRecording = false;
                    this.setState({
                        progress: 0
                    })
                    this.props.onRequestClose({
                        path: data.uri,
                        filename: data.uri.split("/").pop(),
                        mime: "video/" + (data.uri.split("/").pop()).split(".").pop(),
                        height: data.height,
                        width: data.width,
                    })
                }).catch((err) => {
                    this.isRecording = false;
                    this.setState({
                        progress: 0
                    })
                    this.props.onError(err)

                })
            });
        }
    }

    //停止拍摄视频
    stopRecordingVideo() {
        if (this.isRecording) {
            console.log("停止录像")
            this.camera.stopRecording()
            this.isRecording = false
        }
    }

    get tip() {
        if (this.photoEnable && this.videoEnable) {
            return "点击拍照，长按摄像"
        } else if (this.videoEnable) {
            return "长按摄像"
        }
        return "点击拍照"
    }

    render() {
        const touchProps = {}
        if (this.photoEnable) {
            touchProps.onPress = this._onPress
        }
        if (this.videoEnable) {
            touchProps.onPressOut = this._onPressOut;
            touchProps.onLongPress = this._onLonePress
        }
        return (
            <PageModal visible={this.props.visible}
                       onRequestClose={this.close}
                       onShown={this.onShown}
                       onHidden={this.onHidden}
                       hiddenNavBar={true}
                       transition={TransitionType.vertical}>
                <View style={styles.container}>
                    {this.state.showCamera && <RNCamera
                        ref={ref => this.camera = ref}
                        type={this.state.cameraType}
                        flashMode={this.state.flashMode}
                        onBarCodeRead={this.props.onScanResultReceived}
                        permissionDialogTitle={"使用摄像头"}
                        permissionDialogMessage={"是否允许使用摄像头权限"}
                        style={{flex: 1}}/>}
                    <View style={styles.bottomView}>
                        <View style={styles.center}>
                            <Text style={styles.tipText}>{this.isRecording ? "视频录制中" : this.tip}</Text>
                            <View style={styles.tipBtn}>
                                <AnimatedCircleProgress raduis={45}
                                                        totalNum={1}
                                                        progressColor="#1FA5D2"
                                                        progress={this.state.progress}>

                                </AnimatedCircleProgress>
                                <TouchableOpacity style={styles.pressBtn}
                                                  {...touchProps}>
                                    <View style={styles.counter}>
                                        <View style={styles.counterContent}/>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <SafeAreaView style={styles.safeAreaToolBar}>
                        <View style={styles.toolBar}>
                            <TouchableOpacity onPress={this.switchCamera}>
                                <Icon name="camera-party-mode" color="#fff" size={30}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.switchFlash}>
                                <Icon name={this.flashIcon} color="#fff" size={30}/>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.closeBtn} onPress={this.close}>
                                <Icon name="close" color="#fff" size={30}/>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </PageModal>
        )
    }

    async componentDidMount() {
        //申请视频的录音权限
        try {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, {
                title: "申请使用录音权限",
                message: "云筑智联需要使用您的录音设备"
            });
        } catch (ex) {
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,1)'
    },
    closeBtn: {
        backgroundColor: 'rgba(0,0,0,0)',
        padding: 10
    },
    bottomView: {
        height: 150,
        backgroundColor: 'rgba(0,0,0,0)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 38,
        left: 0,
        right: 0
    },
    album: {},
    sureBtn: {
        backgroundColor: 'rgba(0,0,0,0)',
        padding: 10
    },
    safeAreaToolBar:{
        flex:1,
        position: 'absolute',
        right: 0,
        top: 0,
        left: 0,
    },
    toolBar: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 20,
        ...Platform.select({
            ios: {
                height: 44,
            },
            android: {
                height: 56,
            }
        }),

    },
    counter: {
        position: 'absolute',
        right: 0,
        top: 0,
        left: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0)'
    },
    counterContent: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: '#fff',
        width: 56,
        height: 56,
        borderRadius: 28
    },
    pressBtn: {
        position: 'absolute',
        right: 0,
        top: 0,
        left: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tipText: {
        color: '#fff',
        paddingVertical: 8,
        textAlign: 'center'
    },
    tipBtn: {
        width: 90,
        height: 90
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
})
