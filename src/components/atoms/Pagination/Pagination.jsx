/*
Copyright (C) 2020  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

import React from 'react'
import { observer } from 'mobx-react'
import styled, { css } from 'styled-components'

import Arrow from '../../atoms/Arrow'
import HorizontalLoading from '../../atoms/HorizontalLoading'

import StyleProps from '../../styleUtils/StyleProps'
import Palette from '../../styleUtils/Palette'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`
const pageStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${Palette.grayscale[1]};
`
const pageButtonStyle = css`
  width: 32px;
  height: 30px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  padding-top: 2px;
`
const PagePrevious = styled.div`
  border-top-left-radius: ${StyleProps.borderRadius};
  border-bottom-left-radius: ${StyleProps.borderRadius};
  ${pageStyle}
  ${pageButtonStyle}
`
const PageNext = styled.div`
  border-top-right-radius: ${StyleProps.borderRadius};
  border-bottom-right-radius: ${StyleProps.borderRadius};
  ${pageStyle}
  ${pageButtonStyle}
`
const PageNumber = styled.div`
  width: 64px;
  height: 29px;
  flex-direction: column;
  margin: 0 1px;
  padding-top: 3px;
  ${pageStyle}
`

type Props = {
  className?: string,
  style?: any,
  previousDisabled: boolean,
  onPreviousClick: () => void,
  currentPage: number,
  totalPages: number,
  loading?: boolean,
  nextDisabled: boolean,
  onNextClick: () => void,
}

@observer
class Pagination extends React.Component<Props> {
  render() {
    return (
      <Wrapper
        className={this.props.className}
        style={this.props.style}
        onMouseDown={e => { e.preventDefault() }}
      >
        <PagePrevious
          disabled={this.props.previousDisabled}
          onClick={() => { if (!this.props.previousDisabled) { this.props.onPreviousClick() } }}
        >
          <Arrow orientation="left" disabled={this.props.previousDisabled} color={Palette.black} thick />
        </PagePrevious>
        <PageNumber>
          {this.props.currentPage} of {this.props.totalPages}
          {this.props.loading ? (
            <HorizontalLoading style={{ width: '100%', top: '3px' }} />
          ) : null}
        </PageNumber>
        <PageNext
          onClick={() => { if (!this.props.nextDisabled) { this.props.onNextClick() } }}
          disabled={this.props.nextDisabled}
        >
          <Arrow disabled={this.props.nextDisabled} color={Palette.black} thick />
        </PageNext>
      </Wrapper>
    )
  }
}

export default Pagination
