from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework.generics import *
from rest_framework.permissions import *
from rest_framework.views import *
from .serializers import *

class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'Refresh token not provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            BlacklistedToken.objects.create(token=token)
            return Response({'detail': 'Successfully logged out'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)



class UserArticleListCreateView(ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        image_file = self.request.FILES.get('image')

        if image_file:
            serializer.save(
                user=self.request.user,
                image=image_file
            )
        else:
            serializer.save(user=self.request.user)

class UserArticleRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticated]

class CommentListCreateView(ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        article = Article.objects.get(pk=self.kwargs['pk'])
        return article.comments.all()

    def perform_create(self, serializer):
        article = Article.objects.get(pk=self.kwargs['pk'])
        serializer.save(article=article)


class ArticleVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk, action):
        user = request.user

        article = get_object_or_404(Article, pk=pk)

        if action not in ['upvote', 'downvote']:
            return Response({'error': 'Invalid vote action'}, status=status.HTTP_400_BAD_REQUEST)

        is_upvote = action == 'upvote'

        vote, created = ArticleVote.objects.get_or_create(user=user, article=article)

        if not created:
            if vote.is_upvote == is_upvote:
                return Response({'error': f'You already {action}d this article'}, status=status.HTTP_400_BAD_REQUEST)

            if is_upvote:
                article.rating_positive += 1
                article.rating_negative -= 1
            else:
                article.rating_negative += 1
                article.rating_positive -= 1

            vote.is_upvote = is_upvote
            vote.save()

        else:
            if is_upvote:
                article.rating_positive += 1
            else:
                article.rating_negative += 1

            vote.is_upvote = is_upvote
            vote.save()

        article.save()

        return Response({'message': f'Your vote has been {"changed" if not created else "registered"} successfully'})

class CommentVoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id, action):
        user = request.user
        try:
            comment = Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

        if action not in ['upvote', 'downvote']:
            return Response({'error': 'Invalid vote action'}, status=status.HTTP_400_BAD_REQUEST)

        is_upvote = action == 'upvote'

        try:
            vote, created = CommentVote.objects.get_or_create(user=user, comment=comment)

            if not created:
                if vote.is_upvote == is_upvote:
                    return Response({'error': f'You already {action}d this comment'}, status=status.HTTP_400_BAD_REQUEST)

                if is_upvote:
                    comment.rating_positive += 1
                    comment.rating_negative -= 1
                else:
                    comment.rating_negative += 1
                    comment.rating_positive -= 1

                vote.is_upvote = is_upvote
                vote.save()
            else:
                if is_upvote:
                    comment.rating_positive += 1
                else:
                    comment.rating_negative += 1

                vote.is_upvote = is_upvote
                vote.save()

            comment.save()

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': f'Your vote has been {"changed" if not created else "registered"} successfully'})
