import React, { Component, Fragment } from 'react';
import { FixedSizeList } from "react-window";
import { Form } from './parts/Form'
import { Clock } from './parts/Clock';
import dayjs from 'dayjs';
import { ListItem, ListItemText } from '@material-ui/core';


const AcquisitionSecondsAgo = 60;
const AcquisitionPeriodMinutes = 2;


export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);

        const now = dayjs().startOf('minute');
        const oneHourAgo = now.subtract(1, 'hour');

        this.state = {
            displayDateTime: null,
            displayTweets: [],
            keyword: '',
            startDateTime: oneHourAgo,
            isPlay: false
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    /**
     * �Đ��{�^���������C�x���g
     * */
    async handlePlayButton() {
        const keyword = this.state.keyword;
        const startDateTime = this.state.startDateTime;

        //���͘R�ꂪ����ꍇ
        if (!(keyword && startDateTime)) {
            return;
        }

        this.tweets = await this.getTweets(keyword, startDateTime, AcquisitionPeriodMinutes);

        const displayTweets = this.tweets.filter((value) => value.createdAt.isSame(startDateTime, 'second'));

        this.setState(
            {
                displayDateTime: startDateTime,
                displayTweets,
                isPlay: true
            }
        );

        //1�b���Ƃ̃C���^�[�o�����Z�b�g����
        this.intervalId = setInterval(async () => {
            //������1�b����
            const newDisplayDateTime = this.state.displayDateTime.add(1, 's');
            //������(�b)�̃c�C�[�g���i�[
            const nowTweets = this.tweets.filter((value) => !(value instanceof Promise) && value.createdAt.isSame(newDisplayDateTime, 'second'));
            //�������̃c�C�[�g��ǉ�
            const newDisplayTweets = nowTweets.concat(this.state.displayTweets);
            this.setState(
                {
                    displayDateTime: newDisplayDateTime,
                    displayTweets: newDisplayTweets,
                    isPlay: true
                }
            );

            //����擾�����̎w��b�O�ɂȂ�����c�C�[�g���擾����
            if (this.nextAcquisitionDateTime.diff(newDisplayDateTime, 'seconds') === AcquisitionSecondsAgo) {
                const newTweets = await this.getTweets(keyword, this.nextAcquisitionDateTime, AcquisitionPeriodMinutes);
                this.tweets = this.tweets.concat(newTweets);
            }
        }, 1000);
    }

    /**
     * �^�C�}�[��~���C�x���g
     * */
    handleStopButton() {
        //�C���^�[�o�����폜����
        clearInterval(this.intervalId);

        this.tweets = [];

        //�t�H�[���̊J�n�����̏����l�Ƃ��čŌ�̕\���������i�[����
        const startDateTime = this.state.displayDateTime;

        this.setState({
            displayDateTime: null,
            displayTweets: [],
            startDateTime: startDateTime,
            isPlay: false
        });
    }

    render() {
        const clock = this.state.displayDateTime ? <Clock displayDateTime={this.state.displayDateTime} /> : <Fragment />

        const row = ({ index, style }) => (
            <ListItem style={style}>
                <ListItemText
                    primary={this.state.displayTweets[index] ? this.state.displayTweets[index].text : ""}
                />
            </ListItem>
        );
        return (
            <div>
                <Form
                    handlePlayButton={() => this.handlePlayButton()}
                    handleStopButton={() => this.handleStopButton()}
                    keyword={this.state.keyword}
                    setKeyword={(keyword) => this.setState({ keyword })}
                    startDateTime={this.state.startDateTime}
                    setStartDateTime={(startDateTime) => this.setState({ startDateTime })}
                    isPlay={this.state.isPlay}
                />
                {clock}
                {this.state.displayTweets.length > 0 &&
                    <FixedSizeList
                        className="List"
                        height={450}
                        itemCount={this.state.displayTweets.length}
                        itemSize={30}
                        width={1000}
                    >
                        {row}
                    </FixedSizeList>
                }

            </div>
        );
    }

    /**
     * �c�C�[�g���擾����
     * @param {any} keyword
     * @param {any} sinceDateTime
     * @param {any} minutes
     */
    async getTweets(keyword, sinceDateTime, minutes) {
        const strSinceDateTime = sinceDateTime.toISOString();
        const strUntilDateTime = sinceDateTime.add(minutes, 'minutes').toISOString();
        const encodedKeyword = encodeURIComponent(keyword);
        const url = `api/tweetsReplay?keyword=${encodedKeyword}&sinceDateTime=${strSinceDateTime}&untilDateTime=${strUntilDateTime}`;
        const response = await fetch(url);
        const data = await response.json();
        //�c�C�[�g���Ԃ�dayjs�I�u�W�F�N�g�ɕϊ�����
        const tweets = data.map((value) => ({
            tweetId: value.tweetId,
            text: value.text,
            createdAt: dayjs(value.createdAt)
        }));
        //����擾�������Z�b�g����
        this.nextAcquisitionDateTime = sinceDateTime.add(AcquisitionPeriodMinutes, 'minutes');
        return tweets;
    }
}
