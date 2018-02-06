import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { Collapse, Row, Col } from 'react-bootstrap';

import * as Actions from 'store/config/actions';
import { isOpen } from 'store/config/selectors';

import { CollapsibleButton, CollapsibleHeader, AnimatedIcon } from './StyledComponents';

export function Collapsible(props) {
  const {
    id,
    title,
    open,
    children,
    toggleCollapse,
    mountOnEnter,
    unmountOnExit,
  } = props;
  return (
    <div>
      <CollapsibleButton
        bsStyle="link"
        onClick={e => {
          e.preventDefault();
          toggleCollapse(id, open);
        }}
      >
        <CollapsibleHeader>
          {title}
          <AnimatedIcon
            icon="angle-right"
            className={classNames({
              'fa-rotate-90': open,
            })}
          />
        </CollapsibleHeader>
      </CollapsibleButton>
      <Collapse
        in={open}
        mountOnEnter={mountOnEnter}
        unmountOnExit={unmountOnExit}
      >
        <Row>
          <Col xs={12}>
            {children}
          </Col>
        </Row>
      </Collapse>
    </div>
  );
}

Collapsible.defaultProps = {
  mountOnEnter: false,
  unmountOnExit: false,
  open: false,
};

Collapsible.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  toggleCollapse: PropTypes.func.isRequired,
  mountOnEnter: PropTypes.bool,
  unmountOnExit: PropTypes.bool,
  open: PropTypes.bool,
};

const mapStateToProps = (state, props) => ({
  open: isOpen(state, props),
});

export default connect(mapStateToProps, Actions)(Collapsible);

