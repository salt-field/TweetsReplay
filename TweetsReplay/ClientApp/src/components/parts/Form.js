import React from 'react';
import dayjs from 'dayjs';
import { TextField, makeStyles, Button, IconButton } from '@material-ui/core';
import { PlayArrow, Stop } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'inline-block',
        '& .MuiTextField-root': {
            marginRight: theme.spacing(1),
            width: '25ch',
        },
    },
    button: {
        marginRight: theme.spacing(1)
    }
}));

export function Form(props) {
    const classes = useStyles();

    //再生時は停止ボタンを、停止時は再生ボタンを表示する
    const button = props.isPlay ?
        <IconButton className={classes.button} onClick={() => props.handleStopButton()}>
            <Stop />
        </IconButton> :
        <IconButton className={classes.button} onClick={() => props.handlePlayButton()}>
            <PlayArrow />
        </IconButton>;

    return (
        <form className={classes.root}>
            <TextField
                label='キーワード'
                InputLabelProps={{
                    shrink: true,
                }}
                value={props.keyword}
                onChange={(e) => props.setKeyword(e.target.value)}
            />
            <TextField
                label='開始時刻'
                type='datetime-local'
                InputLabelProps={{
                    shrink: true,
                }}
                value={props.startDateTime.format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => props.setStartDateTime(dayjs(e.target.value))}
            />
            {button}
        </form>
    );
}