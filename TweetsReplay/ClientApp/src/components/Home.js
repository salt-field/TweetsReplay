import React, { Component, Fragment } from 'react';
import { FixedSizeList } from "react-window";
import { Form } from './parts/Form'
import { Clock } from './parts/Clock';
import dayjs from 'dayjs';
import { ListItem, ListItemText } from '@material-ui/core';

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

    async handleSearchButton() {
        const keyword = this.state.keyword;
        const startDateTime = this.state.startDateTime;
        const endDateTime = this.state.endDateTime;

        //“ü—Í˜R‚ê‚ª‚ ‚éê‡
        if (!(keyword && startDateTime && endDateTime)) {
            return;
        }

        this.tweets = await this.getTweets(this.state.keyword, startDateTime, 1);
        const displayTweets = this.tweets.filter((value) => value.createdAt.isSame(startDateTime, 'second'));

        this.setState(
            {
                displayDateTime: startDateTime,
                displayTweets,
                isPlay: true
            }
        );

        this.intervalId = setInterval(() => {
            const newDisplayDateTime = this.state.displayDateTime.add(1, 's');
            const nowTweets = this.tweets.filter((value) => value.createdAt.isSame(newDisplayDateTime, 'second'));
            const newDisplayTweets = nowTweets.concat(this.state.displayTweets);
            this.setState(
                {
                    displayDateTime: newDisplayDateTime,
                    displayTweets: newDisplayTweets
                }
            );
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

    async getTweets(keyword, sinceDateTime, minutes) {
        const strSinceDateTime = sinceDateTime.toISOString();
        const strUntilDateTime = sinceDateTime.add(minutes, 'minutes').toISOString();
        const encodedKeyword = encodeURIComponent(keyword);
        const url = `api/tweetsReplay?keyword=${encodedKeyword}&sinceDateTime=${strSinceDateTime}&untilDateTime=${strUntilDateTime}`;
        const response = await fetch(url);
        const data = await response.json();
        const tweets = data.map((value) => ({
            tweetId: value.tweetId,
            text: value.text,
            createdAt: dayjs(value.createdAt)
        }));
        console.log(tweets);
        return tweets;
    }
}
