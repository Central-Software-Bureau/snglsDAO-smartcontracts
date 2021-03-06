import * as React from "react";
import { useState } from "react";
import { Comment, Form, Button, Input, Skeleton } from 'antd';

import AccountImage from "../../Account/AccountImage";
import * as style from './ThreeBoxTreadPage.scss'

const { TextArea } = Input;
const { Item } = Form;

interface ThreeBoxAddMessageProps {
  thread: any;
  profile: any;
  currentAddress: string;
}

const ThreeBoxAddMessage =({ thread, profile, currentAddress }: ThreeBoxAddMessageProps) => {
  const [value, setValue] = useState('')
  const [isSubmitting, seIsSubmitting] = useState(false)

  const handleChange = ({target: {value: val}}: any) => {
    setValue(val)
  };

  const handleSubmit = async () =>{
    seIsSubmitting(true)
    try{
      await thread.post(value)
      setValue('')
    } finally {
      seIsSubmitting(false)
    }
  }

  return (
    <div className={style.antForm}>
    <Comment
      avatar={<div className={style.photo}><AccountImage profile={profile} width={40} accountAddress={currentAddress}  /></div>}
      content={thread
        ? (
          <>
            <Item>
              <TextArea rows={4} onChange={handleChange} value={value} />
            </Item>
            <Item>
              <Button htmlType="submit" className={style.antFormButton} loading={isSubmitting} disabled={isSubmitting || !value} onClick={handleSubmit} type="primary">
                Add message
              </Button>
            </Item>
          </>
        )
        : (<Skeleton />)
      }
    />
    </div>
  )
}

export default ThreeBoxAddMessage
