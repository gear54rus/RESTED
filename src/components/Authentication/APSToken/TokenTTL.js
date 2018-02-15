import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import * as actions from 'store/auth/apsToken/actions';
import { getAPSTokenTTL as getTokenTTL } from 'store/options/selectors';
import { secondsToHM } from 'utils/dateTime';

import { SmallProgressWithOffsetText } from './StyledComponents';

/* eslint-disable react/sort-comp */
class TokenTTL extends React.Component {
  static propTypes = {
    changedTime: PropTypes.number,
    tokenTTL: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setTokenExpired: PropTypes.func.isRequired,
  };

  state = {
    now: 0,
    label: '',
    offset: 0,
  };

  timer = null;
  animateBackground = false;
  backgroundAnimation = null;

  updateBar(changedTime, firstUpdate) {
    const {
      tokenTTL,
      setTokenExpired,
    } = this.props;

    if (!changedTime) {
      setTokenExpired(true);

      this.setState({
        now: 0,
        label: '',
      });

      return;
    }

    const ttlSeconds = parseFloat(tokenTTL) * 60;
    const tokenAgeSeconds = Math.round(((new Date()).getTime() - changedTime) / 1000);
    const secondsLeft = ttlSeconds - tokenAgeSeconds;

    if (secondsLeft > 0) {
      this.setState({
        now: (secondsLeft / ttlSeconds) * 100,
        label: secondsToHM(secondsLeft),
      });
    } else {
      clearInterval(this.timer);
      setTokenExpired(true);

      if (!firstUpdate) {
        this.animateBackground = true;
      }

      this.setState({
        now: 0,
        label: 'TOKEN EXPIRED',
      });
    }
  }

  setUpdating(newTime) {
    clearInterval(this.timer);

    if (newTime) {
      this.props.setTokenExpired(false);
      this.animateBackground = false;
      this.timer = setInterval(() => this.updateBar(newTime), 1000);
    }

    this.updateBar(newTime, true);
  }

  manageUpdating(nextProps) {
    const {
      changedTime,
    } = this.props;

    if (nextProps) {
      if (nextProps.changedTime !== changedTime) {
        this.setUpdating(nextProps.changedTime);
      }
    } else {
      this.setUpdating(changedTime);
    }
  }

  flashBackground(background) {
    const {
      animateBackground,
      backgroundAnimation,
    } = this;

    if (!animateBackground) return;

    if (backgroundAnimation) {
      backgroundAnimation.cancel();
    }

    const style = window.getComputedStyle(background);

    this.animateBackground = false;
    this.backgroundAnimation = background.animate({
      backgroundColor: ['#d9534f', style.backgroundColor],
      color: ['#fff', style.color],
    }, 1500);
  }

  componentWillMount() {
    this.manageUpdating();
  }

  componentWillReceiveProps(nextProps) {
    this.manageUpdating(nextProps);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { now, offset, label } = this.state;

    return (
      <SmallProgressWithOffsetText
        bsStyle="info"
        now={now}
        className={offset < 0 ? 'label-right' : ''}
        label={(
          <div
            className="offset-label"
            style={{ right: offset }}
            ref={ref => { // calculate the placement of label
              if (!ref) return;

              const background = ref.parentElement.parentElement;

              this.flashBackground(background);

              function getWidth(element) {
                return parseFloat(window.getComputedStyle(element).width);
              }

              const ADDITIONAL_MARGIN = 5;
              const width = {
                label: getWidth(ref),
                background: getWidth(background),
              };

              width.bar = width.background * (now / 100);
              // bar width sometimes returned incorrectly
              // so we calculate it manually

              const margin = (ADDITIONAL_MARGIN * 2) + width.label;
              const newOffset = (width.background - width.bar) > margin
                ? -(width.label + ADDITIONAL_MARGIN)
                : ADDITIONAL_MARGIN;

              if (offset !== newOffset) {
                this.setState({ offset: newOffset });
              }
            }}
          >
            {label}
          </div>
        )}
      />
    );
  }
}
/* eslint-enable react/sort-comp */

export default connect(state => ({
  tokenTTL: getTokenTTL(state),
}), { setTokenExpired: actions.setTokenExpired })(TokenTTL);
