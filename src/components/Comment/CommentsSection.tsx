import { useState, useEffect } from 'react';
import { Button, Card, Form, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import Chating from '@/assets/animation/chating.json';
import dynamic from 'next/dynamic';
import { db } from '@/config/firebaseConfig'; // Adjust this import based on your Firebase config location
import { collection, getDocs } from 'firebase/firestore';
import type { Timestamp } from 'firebase/firestore';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface Reaction {
  type: 'like' | 'heart' | 'smile' | 'wow' | 'angry' | 'sad';
  count: number;
  userIds: string[];
}

interface Comment {
  id: string;
  userName: string;
  createdAt: Timestamp;
  text: string;
  reactions?: Reaction[];
  userReaction?: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  userName: string;
  createdAt: Timestamp;
  text: string;
  reactions?: Reaction[];
  userReaction?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  isAuthenticated: boolean;
  isEnrolled: boolean;
  courseId: string;
  userId: string;
  onCommentSubmit: (commentText: string) => void;
  onReplySubmit: (commentId: string, replyText: string) => void;
  onReactionSubmit?: (commentId: string, reactionType: string | null, isReply?: boolean, replyId?: string) => void;
}

const getForumDocumentsCount = async (courseId: string) => {
  try {
    const forumsRef = collection(db, 'courses', courseId, 'forums');
    const snapshot = await getDocs(forumsRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error counting forum documents:', error);
    return 0;
  }
};

const CommentsSection = ({
  comments = [],
  isAuthenticated,
  isEnrolled,
  courseId,
  userId,
  onCommentSubmit,
  onReplySubmit,
  onReactionSubmit = () => {},
}: CommentsSectionProps) => {
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReactionMenu, setShowReactionMenu] = useState<{ id: string; isReply: boolean; replyId?: string } | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [forumCount, setForumCount] = useState<number>(0);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getForumDocumentsCount(courseId);
      setForumCount(count);
    };
    fetchCount();
  }, [courseId]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onCommentSubmit(commentText);
    setCommentText('');
  };

  const handleReplySubmit = (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReplySubmit(commentId, replyText);
    setReplyText('');
    setReplyingTo(null);
  };

  const handleReaction = (commentId: string, reactionType: string | null, isReply = false, replyId?: string) => {
    if (!userId || !courseId || !commentId || (isReply && !replyId)) {
      console.error('Missing required fields:', { userId, courseId, commentId, replyId });
      return;
    }

    const updatedComments = [...localComments];
    let targetComment: Comment | Reply | undefined;

    if (!isReply) {
      const commentIndex = updatedComments.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1) {
        targetComment = updatedComments[commentIndex];
        const currentReaction = targetComment.userReaction;
        
        // Convert null to undefined for userReaction
        const newReaction = currentReaction === reactionType ? undefined : reactionType || undefined;
        
        updatedComments[commentIndex] = {
          ...targetComment,
          userReaction: newReaction,
          reactions: updateReactions(targetComment.reactions, reactionType, currentReaction, userId),
        };
      }
    } else if (isReply && replyId) {
      const commentIndex = updatedComments.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1 && updatedComments[commentIndex].replies) {
        const replyIndex = updatedComments[commentIndex].replies!.findIndex((r) => r.id === replyId);
        if (replyIndex !== -1) {
          targetComment = updatedComments[commentIndex].replies![replyIndex];
          const currentReaction = targetComment.userReaction;
          
          // Convert null to undefined for userReaction
          const newReaction = currentReaction === reactionType ? undefined : reactionType || undefined;
          
          updatedComments[commentIndex].replies![replyIndex] = {
            ...targetComment,
            userReaction: newReaction,
            reactions: updateReactions(targetComment.reactions, reactionType, currentReaction, userId),
          };
        }
      }
    }

    setLocalComments(updatedComments);
    setShowReactionMenu(null);
    onReactionSubmit(commentId, reactionType, isReply, replyId);
  };

  const updateReactions = (
    reactions: Reaction[] = [], 
    newReaction: string | null, 
    currentReaction: string | undefined, 
    userId: string
  ): Reaction[] => {
    const updatedReactions = reactions.map(reaction => {
      const index = reaction.userIds.indexOf(userId);
      if (index !== -1) {
        return {
          ...reaction,
          count: reaction.count - 1,
          userIds: reaction.userIds.filter(id => id !== userId)
        };
      }
      return reaction;
    }).filter(reaction => reaction.count > 0);

    if (newReaction) {
      const existingReaction = updatedReactions.find(r => r.type === newReaction);
      if (existingReaction) {
        existingReaction.count += 1;
        existingReaction.userIds.push(userId);
      } else {
        updatedReactions.push({
          type: newReaction as 'like' | 'heart' | 'smile' | 'wow' | 'angry' | 'sad',
          count: 1,
          userIds: [userId]
        });
      }
    }

    return updatedReactions;
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'heart': return '❤️';
      case 'smile': return '😊';
      case 'wow': return '😮';
      case 'angry': return '😠';
      case 'sad': return '😢';
      default: return '👍';
    }
  };

  const getTotalReactions = (reactions?: Reaction[]) => {
    if (!reactions || reactions.length === 0) return 0;
    return reactions.reduce((sum, reaction) => sum + reaction.count, 0);
  };

  const getUniqueCommentersCount = () => {
    const uniqueUserNames = new Set<string>();
    comments.forEach(comment => {
      uniqueUserNames.add(comment.userName);
      if (comment.replies) {
        comment.replies.forEach(reply => uniqueUserNames.add(reply.userName));
      }
    });
    return uniqueUserNames.size;
  };

  const reactionPopover = (commentId: string, isReply = false, replyId?: string) => (
    <Popover id={`reaction-popover-${commentId}${isReply ? `-${replyId}` : ''}`} className="reaction-popover" style={{ border: '0px solid #2c2350' }}>
      <Popover.Body className="d-flex justify-content-between p-2">
        {['like', 'heart', 'smile', 'wow', 'angry', 'sad'].map((type) => (
          <Button
            key={type}
            variant="light"
            className="reaction-button mx-1 p-1"
            onClick={() => handleReaction(commentId, type, isReply, replyId)}
          >
            <span style={{ fontSize: '1.2rem' }}>{getReactionEmoji(type)}</span>
          </Button>
        ))}
      </Popover.Body>
    </Popover>
  );

  const renderReactionButton = (comment: Comment | Reply, isReply = false, commentId = '', replyId?: string) => {
    const id = isReply ? commentId : (comment as Comment).id || '';
    const currentReaction = comment?.userReaction;

    return (
      <div className="d-flex align-items-center">
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="top"
          show={
            showReactionMenu?.id === id &&
            showReactionMenu?.isReply === isReply &&
            (!isReply || showReactionMenu?.replyId === replyId)
          }
          overlay={reactionPopover(id, isReply, replyId)}
          onToggle={(nextShow) => {
            if (nextShow) {
              setShowReactionMenu({ id, isReply, replyId });
            } else if (
              showReactionMenu?.id === id &&
              showReactionMenu?.isReply === isReply &&
              (!isReply || showReactionMenu?.replyId === replyId)
            ) {
              setShowReactionMenu(null);
            }
          }}
        >
          <Button 
            variant="link" 
            className={`p-0 me-2 ${currentReaction ? 'text-primary' : 'text-muted'}`}
            onClick={(e) => {
              e.stopPropagation();
              if (currentReaction) {
                handleReaction(id, null, isReply, replyId);
              }
            }}
          >
            <span>{currentReaction ? getReactionEmoji(currentReaction) : '👍'}</span>
          </Button>
        </OverlayTrigger>
        {renderReactionsCount(comment.reactions)}
      </div>
    );
  };

  const renderReactionsCount = (reactions?: Reaction[]) => {
    if (!reactions || getTotalReactions(reactions) === 0) return null;
  
    return (
      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip>
            {reactions
              .map((r) => (r.count > 0 ? `${getReactionEmoji(r.type)} ${r.count}` : ''))
              .filter(Boolean)
              .join(' · ')}
          </Tooltip>
        }
      >
        <span className="text-muted small ms-1">{getTotalReactions(reactions)}</span>
      </OverlayTrigger>
    );
  };

  return (
    <div className="comments-section">
      <Card className="mb-4" style={{ borderRadius: 15 }}>
        <Card.Body>
          <div className="mb-2">
            <h4 className="card-title" style={{ fontFamily: "'Acme', sans-serif", color: '#2c3e50', fontSize: 22 }}>
              Q & A
            </h4>
            <small className="text-muted" style={{fontSize: 18}}>
            <i className="bi bi-person-plus me-1" style={{fontSize: 18}}></i> {getUniqueCommentersCount()} {getUniqueCommentersCount() === 1 ? 'users has' : 'users have'} commented |{' '}
              {forumCount} {forumCount === 1 ? 'comment' : 'comments'}
            </small>
          </div>
          <hr />

          {isAuthenticated && isEnrolled ? (
            <Form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="d-flex mb-3">
                <Lottie
                  animationData={Chating}
                  loop={true}
                  style={{
                    width: '50px',
                    height: '50px',
                    justifyContent: 'center',
                    margin: '3 auto',
                  }}
                />
                <div className="flex-grow-1">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Write a comment..."
                    maxLength={500}
                    value={commentText}
                    style={{ height: 45 }}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted">{500 - commentText.length} characters remaining</small>
                    <Button variant="primary" type="submit" disabled={!commentText.trim()}>
                      Send Comment
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          ) : (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              {isAuthenticated
                ? 'Please enroll in the course to participate in the discussion forum.'
                : 'Please login and enroll to participate in the discussion forum.'}
            </div>
          )}

          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {localComments && localComments.length > 0 ? (
              localComments.map((comment) => (
                <Card key={comment.id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex">
                      <Lottie
                        animationData={Chating}
                        loop={true}
                        style={{
                          width: '50px',
                          height: '50px',
                          justifyContent: 'center',
                          margin: '0 auto',
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <h6 className="mb-0">{comment.userName}</h6>
                          <small className="text-muted">
                            {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleString() : ''}
                          </small>
                        </div>
                        <p className="mb-2">{comment.text}</p>
                        <div className="d-flex align-items-center">
                          {renderReactionButton(comment)}
                          <Button
                            variant="link"
                            className="text-muted p-0 me-2"
                            onClick={() => setReplyingTo(comment.id)}
                          >
                            <i className="bi bi-reply"></i> Reply
                          </Button>
                          {renderReactionsCount(comment.reactions)}
                        </div>

                        {replyingTo === comment.id && (
                          <Form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-3">
                            <div className="d-flex mb-3">
                              <Lottie
                                animationData={Chating}
                                loop={true}
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  justifyContent: 'center',
                                  margin: '0 auto',
                                }}
                              />
                              <div className="flex-grow-1">
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  style={{ height: 45 }}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="d-flex justify-content-end mt-2 gap-2">
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    style={{width: 120, height: 45, borderRadius: 10}} 
                                    onClick={() => {
                                      setReplyText('');
                                      setReplyingTo(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="primary" 
                                    size="sm"
                                    style={{width: 120, height: 45, borderRadius: 10}} 
                                    type="submit" 
                                    disabled={!replyText.trim()}
                                  >
                                    Send Reply
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Form>
                        )}

                        <div className="nested-replies mt-3">
                          {comment.replies &&
                            comment.replies.length > 0 &&
                            comment.replies.map((reply) => (
                              <Card key={reply.id} className="mb-2">
                                <Card.Body>
                                  <div className="d-flex">
                                    <Lottie
                                      animationData={Chating}
                                      loop={true}
                                      style={{
                                        width: '50px',
                                        height: '50px',
                                        justifyContent: 'center',
                                        margin: '0 auto',
                                      }}
                                    />
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0">{reply.userName}</h6>
                                        <small className="text-muted">
                                          {reply.createdAt?.toDate ? new Date(reply.createdAt.toDate()).toLocaleString() : ''}
                                        </small>
                                      </div>
                                      <p className="mb-2">{reply.text}</p>
                                      <div className="d-flex align-items-center">
                                        {renderReactionButton(reply, true, comment.id, reply.id)}
                                        <Button variant="link" className="text-muted p-0 me-2">
                                          <i className="bi bi-reply"></i> Reply
                                        </Button>
                                        {renderReactionsCount(reply.reactions)}
                                      </div>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <p className="text-muted">No comments yet!</p>
            )}
          </div>
        </Card.Body>
      </Card>

      <style jsx global>{`
        .reaction-popover .popover-body {
          background-color: white;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.089);
          border-radius: 15px;
        }
        
        .reaction-button {
          border-radius: 50%;
          transition: transform 0.2s;
        }
        
        .reaction-button:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};

export default CommentsSection;