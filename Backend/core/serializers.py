from rest_framework import serializers
from Django.settings import MEDIA_URL
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'email', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Паролі не співпадають."})

        student_email_domains = [
            "@univ.kiev.ua",
            "@ntu.edu.ua",
            "@ukma.edu.ua",
            "@sumdu.edu.ua",
            "@lviv.ua",
            "@lnu.edu.ua",
            "@nmu.edu.ua",
            "@du.edu.ua",
            "@kharkov.ua",
            "@vntu.edu.ua",
            "@chdu.edu.ua",
            "@nau.edu.ua",
            "@hneu.edu.ua",
            "@kpi.ua",
            "@od.ua",
        ]
        email = data.get('email')
        if not any(email.endswith(domain) for domain in student_email_domains):
            raise serializers.ValidationError({"email": "Введена пошта не є корпоративною студентською поштою."})

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        validated_data['username'] = validated_data['email']
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError({"error": "Невірне пошта або пароль."})

        refresh = RefreshToken.for_user(user)
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email']


class ArticleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'image_url', 'user', 'rating_positive', 'rating_negative', 'created_at', 'views', 'comment_count']
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_comment_count(self, obj):
        return obj.approved_comment_count()

    def get_image_url(self, obj):
        if obj.image:
            return f"{MEDIA_URL}{obj.image}"
        return None


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'article', 'rating_negative', 'rating_positive', 'message', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        article = validated_data['article']
        user = self.context['request'].user
        validated_data['user'] = user
        comment = Comment.objects.create(**validated_data)
        return comment
