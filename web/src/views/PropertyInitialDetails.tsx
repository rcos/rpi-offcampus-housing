import React, {useEffect, useRef, useState} from 'react'
import Centered from '../components/toolbox/layout/Centered'
import {useGetPropertyLazyQuery, Property} from '../API/queries/types/graphqlFragmentTypes'
import Counter, {positiveOnly, maxVal} from '../components/toolbox/form/Counter'
import {useUpdatePropertyDetailsMutation} from '../API/queries/types/graphqlFragmentTypes'
import {motion, useSpring, useTransform} from 'framer-motion'
import {useHistory} from 'react-router'

interface QuestionResponse {
    hasHeater: boolean | null
    hasAC: boolean | null
    hasWashingMachine: boolean | null
    isFurnished: boolean | null
    sqFt: number
    bathrooms: number
    rooms: number
    description: string
}

const PropertyInitialDetails = ({property_id}: {property_id: string}) => {

    const history = useHistory()
    const [GetProperty, {data: propertyResponse}] = useGetPropertyLazyQuery({
        fetchPolicy: 'no-cache'
    })
    const [property, setProperty] = useState<Property|null>(null)
    const [UpdatePropertyDetails, {data: updatePropertyResponse}] = useUpdatePropertyDetailsMutation()

    useEffect (() => {
        GetProperty({
            variables: {
                id: property_id,
                withLandlord: false,
                withReviews: false,
                reviewCount: 0, reviewOffset: 0
            }
        })
    }, [])

    useEffect(() => {
        if (propertyResponse && propertyResponse.getProperty && propertyResponse.getProperty.data) {
            if (propertyResponse.getProperty.data.details) {
                history.push(`/landlord/property/${property_id}`)
            }
            else {        
                setProperty(propertyResponse.getProperty.data)
            }
        }
    }, [propertyResponse])

    
    const [questionIndex, setQuestionIndex] = useState<number>(0)
    const questionIndexRef = useRef<number>(0)
    const [response, setResponse] = useState<QuestionResponse>({
        hasHeater: null,
        hasAC: null,
        hasWashingMachine: null,
        isFurnished: null,
        sqFt: 0,
        bathrooms: 0,
        rooms: 0,
        description: ""
    })
    const [submitting, setSubmitting] = useState<boolean>(false)

    const goNext = () => {
        if ( (questions[questionIndex][1] as Function)( (response as any)[ questions[questionIndex][2] as any ] ) ) {
            questionChangeSpring.set(0)
            questionIndexRef.current = questionIndex + 1
        }
    }

    const goBack = () => {
        questionChangeSpring.set(0)
        questionIndexRef.current = questionIndex - 1
    }

    useEffect(() => {

        const unsubQuestionChangeSpring = questionChangeSpring.onChange((x: number) => {
            if (x == 0) {
                setQuestionIndex(questionIndexRef.current)
            }
        })

        return () => {
            unsubQuestionChangeSpring()
        }
    }, [])

    useEffect(() => {
        if (questionIndex >= questions.length) {
            setSubmitting(true)
        }
        else questionChangeSpring.set(1)
    }, [questionIndex])

    useEffect(() => {
        if (submitting) {
            UpdatePropertyDetails({
                variables: {
                    property_id,
                    description: response.description,
                    rooms: response.rooms,
                    bathrooms: response.bathrooms,
                    sq_ft: response.sqFt,
                    furnished: response.isFurnished,
                    has_washer: response.hasWashingMachine,
                    has_heater: response.hasHeater,
                    has_ac: response.hasAC
                }
            })
        }
    }, [submitting])

    useEffect(() => {
        if (updatePropertyResponse && updatePropertyResponse.updatePropertyDetails
            && updatePropertyResponse.updatePropertyDetails.data) {
            history.push(`/landlord/property/${property_id}`)
        }
    }, [updatePropertyResponse])

    // Questions
    const roomCountQuestion = (<div>
        <div className="question-line">How many <span className="emphasize">rooms</span> does this property have?</div>
        <div className="question-input">
            <Counter 
            key={0}
            initial={0}
                restrictions={[positiveOnly, maxVal(10, {inclusive: true})]}
                onChange={(x: number) => {
                    let response_ = {...response};
                    response_.rooms = x;
                    setResponse(response_)
                }}
            />
        </div>
    </div>)

    const bathroomCountQuestion = (<div>
        <div className="question-line">How many <span className="emphasize">bathrooms</span> does this property have?</div>
        <div className="question-input">
            <Counter 
            key={1}
            initial={0}
            restrictions={[positiveOnly, maxVal(10, {inclusive: true})]}
            onChange={(x: number) => {
                    let response_ = {...response};
                    response_.bathrooms = x;
                    setResponse(response_)
                }}/>
        </div>
    </div>)

    const sqFtQuestion = (<div>
        <div className="question-line">How many <span className="emphasize">square feet</span> is your property?</div>
        <div className="question-input">
            <Counter 
            key={2}
            initial={0}
            incrementBy={100}
            restrictions={[positiveOnly]}
            onChange={(x: number) => {
                let response_ = {...response};
                response_.sqFt = x;
                setResponse(response_)
            }}/>
        </div>
    </div>)

    const furnishedQuestion = (<div>
        <div className="question-line">Is the property <span className="emphasize">furnished</span>?</div>
        <div className="question-input">
            <div className="button-group">
                <div className="btn"><div className={`subtle-button ${response.isFurnished == true ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.isFurnished = true;
                    setResponse(response_)
                }}>Yes</div></div>
                <div className="btn"><div className={`subtle-button ${response.isFurnished == false ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.isFurnished = false;
                    setResponse(response_)
                }}>No</div></div>
            </div>    
        </div>
    </div>)

    const washerQuestion = (<div>
        <div className="question-line">Does the property have a working <span className="emphasize">washing machine</span>?</div>
        <div className="question-input">
            <div className="button-group">
                <div className="btn"><div className={`subtle-button ${response.hasWashingMachine == true ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.hasWashingMachine = true;
                    setResponse(response_)
                }}>Yes</div></div>
                <div className="btn"><div className={`subtle-button ${response.hasWashingMachine == false ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.hasWashingMachine = false;
                    setResponse(response_)
                }}>No</div></div>
            </div>
        </div>
    </div>)

    const heatingQuestion = (<div>
        <div className="question-line">Is there a <span className="emphasize">heater</span>?</div>
        <div className="question-input">
            <div className="button-group">
                <div className="btn"><div className={`subtle-button ${response.hasHeater == true ? 'active' : ''}`}  onClick={() => {
                    let response_ = {...response};
                    response_.hasHeater = true;
                    setResponse(response_)
                }}>Yes</div></div>
                <div className="btn"><div className={`subtle-button ${response.hasHeater == false ? 'active' : ''}`}  onClick={() => {
                    let response_ = {...response};
                    response_.hasHeater = false;
                    setResponse(response_)
                }}>No</div></div>
            </div>
        </div>
    </div>)

    const coolingQuestion = (<div>
        <div className="question-line">Is there a <span className="emphasize">air conditioning</span>?</div>
        <div className="question-input">
            <div className="button-group">
                <div className="btn"><div className={`subtle-button ${response.hasAC == true ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.hasAC = true;
                    setResponse(response_)
                }}>Yes</div></div>
                <div className="btn"><div className={`subtle-button ${response.hasAC == false ? 'active' : ''}`} onClick={() => {
                    let response_ = {...response};
                    response_.hasAC = false;
                    setResponse(response_)
                }}>No</div></div>
            </div>
        </div>
    </div>)

    const descriptionAdd = (<div>
        <div className="question-line">Add a property description for others to see.</div>
        <div className="question-input">
            <div className="textarea-holder" 
            style={{
                width: `100%`,
                transform: `translateY(-20px)`
            }}>
                <textarea 
                    style={{
                        fontFamily: `sans-serif`,
                        fontSize: `0.75rem`,
                        letterSpacing: `0.8px`
                    }}
                    onChange={(e: any) => {
                    let response_ = {...response};
                    response_.description = e.target.value
                    setResponse(response_)
                }}></textarea>
                <div className={`word-counter ${response.description.length > 200 ? `over-limit`: `good`}`}>{response.description.length}/200</div>
            </div>
        </div>
    </div>)

    const questions = [[roomCountQuestion, (x: number) => x != 0, "rooms"], 
                        [bathroomCountQuestion, (x: number) => x != 0, "bathrooms"], 
                        [sqFtQuestion, (x: number) => x != 0, "sqFt"],
                        [furnishedQuestion, (x: boolean | null): boolean => x != null, "isFurnished"], 
                        [washerQuestion, (x: boolean | null): boolean => x != null, "hasWashingMachine"], 
                        [heatingQuestion, (x: boolean | null): boolean => x != null, "hasHeater"], 
                        [coolingQuestion, (x: boolean | null): boolean => x != null, "hasAC"],
                        [descriptionAdd, (x: string): boolean => x.length > 50 && x.length < 200, "description"]]

    const questionChangeSpring = useSpring(1, {duration: 500})

    return (<Centered width={400} height={600}>
        <React.Fragment>

        {!submitting && property != null && <div 
            className="initial-details-container"
            style={{
                height: `100%`
        }}>
            <div className="title-area" style={{fontSize: `1rem`}}>Details About Your Property</div>
            <div className="address-line">{property.address_line}, {property.address_line_2? `${property.address_line_2},`:``} {property.city} {property.state}, {property.zip}</div>
            

            <div className="question-area">
                <div className="question-tracker">Question {questionIndex+1} of {questions.length}</div>
                <motion.div style={{
                    opacity: questionChangeSpring
                }}>
                    {questionIndex < questions.length ? questions[questionIndex][0] : ""}
                    {questionIndex != 0 && <div onClick={goBack} style={{float: `left`}}>
                        <div className="subtle-button" style={{width: `60px`, marginTop: `20px`}}>Back</div>
                    </div>}
                    <div onClick={goNext} style={{float: `right`}}>
                    <div className="subtle-button" style={{width: `60px`, marginTop: `20px`}}>{
                        questionIndex == questions.length - 1 ? 'Complete' : 'Next'
                    }</div>
                    </div>
                </motion.div>
            </div>
        </div>}
        </React.Fragment>
    </Centered>)
}

export default PropertyInitialDetails