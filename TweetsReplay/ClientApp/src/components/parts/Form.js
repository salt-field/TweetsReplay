import React from 'react';
import { TextField, makeStyles, Button } from '@material-ui/core';
import dayjs from 'dayjs';

const useStyles = makeStyles((theme) => ({
    root: {
        '& .MuiTextField-root': {
            marginRight: theme.spacing(1),
            width: '25ch',
        },
    },
}));

export function Form(props) {
    const classes = useStyles();

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
            <TextField
                label='終了時刻'
                type='datetime-local'
                InputLabelProps={{
                    shrink: true,
                }}
                value={props.endDateTime.format('YYYY-MM-DDTHH:mm')}
                onChange={(e) => props.setEndDateTime(dayjs(e.target.value))}
            />
            <Button
                onClick={() => props.handleSearchButton()}
                variant="contained"
                color="primary"
            >
                検索
            </Button>
            <Button
                onClick={() => props.handlePlayButton()}
                variant="contained"
                color="primary"
            >
                再生
            </Button>
        </form>
    );
}