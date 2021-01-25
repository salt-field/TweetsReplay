import React from 'react';
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'inline-block',
        fontSize: 30
    },
}));

export function Clock(props) {

    const classes = useStyles();

    return (
        <Typography className={classes.root}>
            {props.displayDateTime.format('YYYY-MM-DD HH:mm:ss')}
        </Typography>
    );
}