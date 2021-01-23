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
            endDateTime: now,
            isPlay: false
        };
    }

    componentWillUnmount() {
        clearInterval(this.intervalId);
    }

    /**
     * 検索ボタン押下時イベント
     * */
    async handleSearchButton() {
        const keyword = this.state.keyword;
        const startDateTime = this.state.startDateTime;
        const endDateTime = this.state.endDateTime;

        //入力漏れがある場合
        if (!(keyword && startDateTime && endDateTime)) {
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

        //1秒ごとのインターバルをセットする
        this.intervalId = setInterval(async () => {
            //時刻を1秒足す
            const newDisplayDateTime = this.state.displayDateTime.add(1, 's');
            //現時刻(秒)のツイートを格納
            const nowTweets = this.tweets.filter((value) => !(value instanceof Promise) && value.createdAt.isSame(newDisplayDateTime, 'second'));
            //現時刻のツイートを追加
            const newDisplayTweets = nowTweets.concat(this.state.displayTweets);
            this.setState(
                {
                    displayDateTime: newDisplayDateTime,
                    displayTweets: newDisplayTweets
                }
            );

            //次回取得時刻の指定秒前になったらツイートを取得する
            if (this.nextAcquisitionDateTime.diff(newDisplayDateTime,'seconds')===AcquisitionSecondsAgo) {
                const newTweets = await this.getTweets(keyword, this.nextAcquisitionDateTime, AcquisitionPeriodMinutes);
                this.tweets = this.tweets.concat(newTweets);
            }
        }, 1000);
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
                    handleSearchButton={(keyword, startDateTime, endDateTime) => this.handleSearchButton(keyword, startDateTime, endDateTime)}
                    handlePlayButton={() => this.setState({ isPlay: true })}
                    keyword={this.state.keyword}
                    setKeyword={(keyword) => this.setState({ keyword })}
                    startDateTime={this.state.startDateTime}
                    setStartDateTime={(startDateTime) => this.setState({ startDateTime })}
                    endDateTime={this.state.endDateTime}
                    setEndDateTime={(endDateTime) => this.setState({ endDateTime })}
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
     * ツイートを取得する
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
        //ツイート時間をdayjsオブジェクトに変換する
        const tweets = data.map((value) => ({
            tweetId: value.tweetId,
            text: value.text,
            createdAt: dayjs(value.createdAt)
        }));
        //次回取得時刻をセットする
        this.nextAcquisitionDateTime = sinceDateTime.add(AcquisitionPeriodMinutes, 'minutes');
        return tweets;
    }
}
