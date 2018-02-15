/* eslint-disable no-confusing-arrow */
import styled, { css } from 'styled-components';

const ease = 'cubic-bezier(0.23, 1, 0.32, 1)';
const iconSize = 16;

export const StyledButton = styled.button`
  border: 10px none;
  box-sizing: border-box;
  overflow: visible;
  width: ${iconSize * 2}px;
  height: ${iconSize * 1.5}px;
  font-size: 0;
  background-color: transparent;

  display: inline-block;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  text-decoration: none;
  margin: 0;
  outline: none;
  position: relative;
  z-index: 1;

  .fas {
    font-size: ${iconSize}px;
  }
`;

const containerWhenShown = css`
  top: ${iconSize * 1.5}px;
  opacity: 0.9;
  transform: translate(0px, 5px);
  transition: 0ms top ${ease} 0ms, 450ms transform ${ease} 0ms, 450ms opacity ${ease} 0ms;
`;

const rippleWhenShown = css`
  background-color: rgb(97, 97, 97);
  transition: 45ms width ${ease} 0ms, 450ms height ${ease} 0ms, 450ms background-color ${ease} 0ms;
`;

export const TooltipContainer = styled.div`
  position: absolute;
  font-size: 12px;
  line-height: 25px;
  padding: 0 10px;
  z-index: 200;
  color: white;
  overflow: hidden;
  top: -10000px;
  border-radius: 2px;
  user-select: none;
  opacity: 0;
  left: ${props => ((props.offsetWidth - (iconSize * 2)) / 2) * -1}px;

  transition: 0ms top ${ease} 450ms, 450ms transform ${ease} 0ms, 450ms opacity ${ease} 0ms;

  ${props => props.show && containerWhenShown}
`;

export const Ripple = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  color: black;
  background-color: transparent;
  transition: 0ms width ${ease} 450ms, 0ms height ${ease} 450ms, 450ms background-color ${ease} 0ms;

  ${props => props.show && rippleWhenShown}
`;

export const TooltipLabel = styled.span`
  position: relative;
  white-space: nowrap;
`;
