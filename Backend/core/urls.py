from django.urls import path
from rest_framework_simplejwt.views import *
from .views import *
from django.conf.urls.static import static

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('article/', UserArticleListCreateView.as_view(), name='article'),
    path('article/<int:pk>/', UserArticleRetrieveUpdateDestroyView.as_view(), name='article_edit'),
    path('article/<int:pk>/comments/', CommentListCreateView.as_view(), name='comment-list-create'),
    path('article/<int:pk>/vote/<str:action>/', ArticleVoteView.as_view(), name='article-vote'),
    path('comment/<int:comment_id>/vote/<str:action>/', CommentVoteView.as_view(), name='comment-vote'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
