import React, { Fragment } from 'react';
import { Typography } from "@material-ui/core";

export function Clock(props) {
    return (
        <Fragment>
            <Typography>
                {props.displayDateTime.format('YYYY-MM-DD HH:mm:ss')}
            </Typography>
        </Fragment>
    );
}