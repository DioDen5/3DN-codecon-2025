from django.db import models
from cloudinary.models import CloudinaryField
from django.contrib.auth.models import User


class Article(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=50, unique=True)
    content = models.TextField()
    rating_negative = models.IntegerField(default=0)
    rating_positive = models.IntegerField(default=0)
    image = CloudinaryField('image')
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.IntegerField(default=0)

    def approved_comment_count(self):
        return self.comments.count()

    def __str__(self):
        return self.title

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    rating_negative = models.IntegerField(default=0)
    rating_positive = models.IntegerField(default=0)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} -> {self.article.title}"

class ArticleVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    article = models.ForeignKey(Article, on_delete=models.CASCADE)
    is_upvote = models.BooleanField()

    class Meta:
        unique_together = ('user', 'article')

class CommentVote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
    is_upvote = models.BooleanField()

    class Meta:
        unique_together = ('user', 'comment')
